const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Anthropic = require('@anthropic-ai/sdk');
const { EDUCATIONAL_PROMPT, QUESTION_ANALYSIS_PROMPT, CONCEPT_EXPLANATION_PROMPT, CONCEPT_RELATION_PROMPT, FORMULA_GENERATION_PROMPT } = require('./prompts');

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


// Initial chat endpoint with question analysis
app.post('/api/chat/initial', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // First call: Analyze the question structure
    const analysisResponse = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-latest',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: QUESTION_ANALYSIS_PROMPT + message
      }]
    });

    console.log('Analysis response:', analysisResponse.content[0].text);

    let analysis;
    try {
      let jsonText = analysisResponse.content[0].text;
      
      // Remove markdown code blocks if present
      if (jsonText.includes('```json')) {
        jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```/, '');
      }
      
      analysis = JSON.parse(jsonText.trim());
      console.log('Parsed analysis:', analysis);
    } catch (parseError) {
      console.warn('Failed to parse analysis JSON:', parseError);
      console.warn('Raw response was:', analysisResponse.content[0].text);
      analysis = {
        quantities: [],
        goal: null,
        problemSummary: "Problem analysis unavailable"
      };
    }

    // Second call: Generate educational response
    const educationalResponse = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-latest',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: message
      }],
      system: EDUCATIONAL_PROMPT
    });

    const assistantMessage = educationalResponse.content[0].text;

    res.json({
      message: assistantMessage,
      analysis: analysis,
      success: true
    });

  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({
      error: 'Failed to process message',
      details: error.message
    });
  }
});

// Regular chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversation = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
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
      // Add current message
      {
        role: 'user',
        content: message
      }
    ];

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-latest',
      max_tokens: 1000,
      messages: messages.slice(1), // Remove system message from messages array
      system: EDUCATIONAL_PROMPT
    });

    const assistantMessage = response.content[0].text;

    res.json({
      message: assistantMessage,
      success: true
    });

  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({
      error: 'Failed to process message',
      details: error.message
    });
  }
});

// Concept explanation endpoint
app.post('/api/concept/explain', async (req, res) => {
  try {
    const { concept, problemContext } = req.body;

    if (!concept) {
      return res.status(400).json({ error: 'Concept is required' });
    }

    const prompt = CONCEPT_EXPLANATION_PROMPT
      .replace('[CONCEPT]', concept)
      .replace('[PROBLEM_CONTEXT]', problemContext || 'general STEM problem');

    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-latest',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt + concept
      }]
    });

    res.json({
      explanation: response.content[0].text,
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

// Concept relation endpoint  
app.post('/api/concept/relate', async (req, res) => {
  try {
    const { concept, problemContext } = req.body;

    if (!concept) {
      return res.status(400).json({ error: 'Concept is required' });
    }

    const prompt = CONCEPT_RELATION_PROMPT
      .replace('[CONCEPT]', concept)
      .replace('[PROBLEM_CONTEXT]', problemContext || 'general STEM problem');

    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-latest',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: prompt + concept
      }]
    });

    res.json({
      relation: response.content[0].text,
      success: true
    });

  } catch (error) {
    console.error('Error explaining concept relation:', error);
    res.status(500).json({
      error: 'Failed to explain concept relation',
      details: error.message
    });
  }
});

// Formula categories endpoint - returns resources from analysis
app.post('/api/formulas/categories', async (req, res) => {
  try {
    const { problemContext, resources } = req.body;

    // If resources are provided directly, return them as categories
    if (resources && Array.isArray(resources)) {
      const categories = resources.map((resource, index) => ({
        id: resource.toLowerCase().replace(/\s+/g, '-'),
        name: resource
      }));
      
      res.json({
        categories: categories,
        success: true
      });
      return;
    }

    // Fallback: re-analyze the problem context if no resources provided
    if (problemContext) {
      const analysisResponse = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-latest',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: QUESTION_ANALYSIS_PROMPT + problemContext
        }]
      });

      let analysis;
      try {
        let jsonText = analysisResponse.content[0].text;
        if (jsonText.includes('```json')) {
          jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```/, '');
        }
        analysis = JSON.parse(jsonText.trim());
        
        const categories = (analysis.resources || []).map((resource, index) => ({
          id: resource.toLowerCase().replace(/\s+/g, '-'),
          name: resource
        }));
        
        res.json({
          categories: categories,
          success: true
        });
      } catch (parseError) {
        console.warn('Failed to parse analysis for categories:', parseError);
        res.json({
          categories: [],
          success: true
        });
      }
    } else {
      res.json({
        categories: [],
        success: true
      });
    }

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
      let jsonText = response.content[0].text;
      if (jsonText.includes('```json')) {
        jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```/, '');
      }
      formulaData = JSON.parse(jsonText.trim());
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
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});