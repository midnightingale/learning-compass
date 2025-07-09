const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Anthropic = require('@anthropic-ai/sdk');
const { EDUCATIONAL_PROMPT, QUESTION_ANALYSIS_PROMPT, COMBINED_CONCEPT_PROMPT, FORMULA_GENERATION_PROMPT } = require('./prompts');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Utility functions
const parseJsonResponse = (text) => {
  let jsonText = text;
  
  // Remove markdown code blocks if present
  if (jsonText.includes('```json')) {
    jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```/, '');
  }
  
  return JSON.parse(jsonText.trim());
};

const handleStreamingResponse = async (stream, res) => {
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta') {
      res.write(`data: ${JSON.stringify({ type: 'content', text: chunk.delta.text })}\n\n`);
    } else if (chunk.type === 'message_stop') {
      res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
      break;
    }
  }
  res.end();
};

const setupStreamingHeaders = (res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
};

const handleStreamingError = (res, message = 'Failed to process message') => {
  res.write(`data: ${JSON.stringify({ type: 'error', message })}\n\n`);
  res.end();
};

const createAnthropicMessage = async (model, maxTokens, messages, systemPrompt, stream = false) => {
  return await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    messages,
    system: systemPrompt,
    ...(stream && { stream: true })
  });
};


// Initial chat endpoint with question analysis
app.post('/api/chat/initial', async (req, res) => {
  try {
    const { message, stream = false } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // First call: Analyze the question structure
    const analysisResponse = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-latest',
      max_tokens: 2500,
      messages: [{
        role: 'user',
        content: QUESTION_ANALYSIS_PROMPT + message
      }]
    });

    console.log('Analysis response:', analysisResponse.content[0].text);

    let analysis;
    try {
      analysis = parseJsonResponse(analysisResponse.content[0].text);
      console.log('Parsed analysis:', analysis);
    } catch (parseError) {
      console.warn('Failed to parse analysis JSON:', parseError);
      console.warn('Raw response was:', analysisResponse.content[0].text);
      analysis = {
        title: "Problem Analysis",
        quantities: [],
        goal: null,
        problemSummary: "Problem analysis unavailable",
        formulas: []
      };
    }

    if (stream) {
      setupStreamingHeaders(res);
      
      // Send analysis first
      res.write(`data: ${JSON.stringify({ type: 'analysis', analysis })}\n\n`);

      // Second call: Generate educational response with streaming
      const educationalStream = await createAnthropicMessage(
        'claude-3-7-sonnet-latest',
        1000,
        [{ role: 'user', content: message }],
        EDUCATIONAL_PROMPT,
        true
      );

      await handleStreamingResponse(educationalStream, res);
    } else {
      // Regular non-streaming response
      const educationalResponse = await createAnthropicMessage(
        'claude-3-7-sonnet-latest',
        1000,
        [{ role: 'user', content: message }],
        EDUCATIONAL_PROMPT
      );

      const assistantMessage = educationalResponse.content[0].text;

      res.json({
        message: assistantMessage,
        analysis: analysis,
        success: true
      });
    }

  } catch (error) {
    console.error('Error calling Claude API:', error);
    if (req.body.stream) {
      handleStreamingError(res, 'Failed to process message');
    } else {
      res.status(500).json({
        error: 'Failed to process message',
        details: error.message
      });
    }
  }
});

// Regular chat endpoint with streaming support
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversation = [], images = [], stream = false } = req.body;

    if (!message && (!images || images.length === 0)) {
      return res.status(400).json({ error: 'Message or image is required' });
    }

    // Build conversation history for Claude
    const messages = [
      {
        role: 'system',
        content: EDUCATIONAL_PROMPT
      },
      // Add previous conversation
      ...conversation.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      // Add current message with images if present
      {
        role: 'user',
        content: images.length > 0 
          ? [
              ...images.map(img => ({
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: img.type,
                  data: img.data
                }
              })),
              {
                type: 'text',
                text: message || "What can you help me understand about this image?"
              }
            ]
          : (message || "What can you help me understand about this image?")
      }
    ];

    if (stream) {
      setupStreamingHeaders(res);

      // Call Claude API with streaming
      const streamResponse = await createAnthropicMessage(
        'claude-3-7-sonnet-latest',
        1000,
        messages.slice(1), // Remove system message from messages array
        EDUCATIONAL_PROMPT,
        true
      );

      await handleStreamingResponse(streamResponse, res);
    } else {
      // Regular non-streaming response
      const response = await createAnthropicMessage(
        'claude-3-7-sonnet-latest',
        1000,
        messages.slice(1), // Remove system message from messages array
        EDUCATIONAL_PROMPT
      );

      const assistantMessage = response.content[0].text;

      res.json({
        message: assistantMessage,
        success: true
      });
    }

  } catch (error) {
    console.error('Error calling Claude API:', error);
    if (req.body.stream) {
      handleStreamingError(res, 'Failed to process message');
    } else {
      res.status(500).json({
        error: 'Failed to process message',
        details: error.message
      });
    }
  }
});

// Combined concept explanation and relation endpoint
app.post('/api/concept/combined', async (req, res) => {
  try {
    const { concept, problemContext } = req.body;

    if (!concept) {
      return res.status(400).json({ error: 'Concept is required' });
    }

    const prompt = COMBINED_CONCEPT_PROMPT
      .replace(/\[CONCEPT\]/g, concept)
      .replace('[PROBLEM_CONTEXT]', problemContext || 'general STEM problem');

    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-latest',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt + concept
      }]
    });

    let conceptData;
    try {
      conceptData = parseJsonResponse(response.content[0].text);
    } catch (parseError) {
      console.warn('Failed to parse concept JSON:', parseError);
      console.warn('Raw response was:', response.content[0].text);
    }

    res.json({
      ...conceptData,
      success: true
    });

  } catch (error) {
    console.error('Error explaining concept:', error);
    res.status(500).json({
      error: 'Failed to explain concept',
      details: error.message
    });
  }
});

// Formula categories endpoint - returns resources from analysis
app.post('/api/formulas/categories', async (req, res) => {
  try {
    const { resources } = req.body;

    const categories = resources && Array.isArray(resources) 
      ? resources.map((resource) => ({
          id: resource.toLowerCase().replace(/\s+/g, '-'),
          name: resource
        }))
      : [];
    
    res.json({ categories, success: true });

  } catch (error) {
    console.error('Error fetching formula categories:', error);
    res.status(500).json({
      error: 'Failed to fetch formula categories',
      details: error.message
    });
  }
});

// Formula generation endpoint
app.post('/api/formulas', async (req, res) => {
  try {
    const { categoryId, problemContext } = req.body;

    if (!categoryId) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    // Convert category ID back to resource name
    const resourceName = categoryId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const prompt = FORMULA_GENERATION_PROMPT
      .replace('[PROBLEM]', problemContext || 'general STEM problem')
      .replace('[RESOURCE]', resourceName);

    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-latest',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt + resourceName
      }]
    });

    let formulaData;
    try {
      formulaData = parseJsonResponse(response.content[0].text);
    } catch (parseError) {
      console.warn('Failed to parse formula JSON:', parseError);
      console.warn('Raw response was:', response.content[0].text);
      
      // Fallback formula
      formulaData = {
        title: resourceName,
        formula: "Formula not available",
        variables: []
      };
    }

    res.json({
      ...formulaData,
      success: true
    });

  } catch (error) {
    console.error('Error generating formula:', error);
    res.status(500).json({
      error: 'Failed to generate formula',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (_, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});