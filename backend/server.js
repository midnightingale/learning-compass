const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Anthropic = require('@anthropic-ai/sdk');
const { CHAT_TUTOR_PROMPT, QUESTION_ANALYSIS_PROMPT, COMBINED_CONCEPT_PROMPT } = require('./prompts');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MODEL = 'claude-sonnet-4-20250514';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Utility functions

const parseJsonResponse = (text) => {
  try {
    let jsonText = text;
    
    // Claude tends to prefix json responses with ```json even if instructed not to, so we remove this
    if (jsonText.includes('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```/, '');
    }
    
    return JSON.parse(jsonText.trim());
  } catch (parseError) {
    console.warn('Failed to parse JSON response:', parseError);
    console.warn('Raw response was:', text);
    return null;
  }
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

const handleAPIError = (res, message = 'Failed to process message') => {
  res.write(`data: ${JSON.stringify({ type: 'error', message })}\n\n`);
  res.end();
};

const buildConversationMessages = (message, conversation = []) => {
  return [
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


// Initial chat endpoint with question analysis:
// Sends the question for analysis, then grabs the first message from the tutor chatbot
app.post('/api/chat/initial', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // First call: Analyze the question structure
    const analysisResponse = await createAnthropicMessage(
      MODEL,
      2500,
      [{ role: 'user', content: QUESTION_ANALYSIS_PROMPT + message }]
    );

    console.log('Analysis response:', analysisResponse.content[0].text);

    const analysis = parseJsonResponse(analysisResponse.content[0].text) || {
      title: "Problem Analysis",
      quantities: [],
      goal: null,
      problemSummary: "Problem analysis unavailable",
      formulas: []
    };
    console.log('Parsed analysis:', analysis);

    setupStreamingHeaders(res);

    // Send analysis first
    res.write(`data: ${JSON.stringify({ type: 'analysis', analysis })}\n\n`);

    // Second call: get the first chat message from the chat tutor
    const chatStream = await createAnthropicMessage(
      MODEL,
      1000,
      [{ role: 'user', content: message }],
      CHAT_TUTOR_PROMPT,
      true
    );

    await handleStreamingResponse(chatStream, res);

  } catch (error) {
    console.error('Error calling Claude API:', error);
    handleAPIError(res, 'Failed to process message');
  }
});

// Regular chat endpoint with streaming
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversation = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const messages = buildConversationMessages(message, conversation);

    setupStreamingHeaders(res);

    const streamResponse = await createAnthropicMessage(
      MODEL,
      1000,
      messages,
      CHAT_TUTOR_PROMPT,
      true
    );

    await handleStreamingResponse(streamResponse, res);

  } catch (error) {
    console.error('Error calling Claude API:', error);
    handleAPIError(res, 'Failed to process message');
  }
});

// Combined concept explanation and relation endpoint
app.post('/api/concept', async (req, res) => {
  try {
    const { concept, problemContext } = req.body;

    if (!concept) {
      return res.status(400).json({ error: 'Concept is required' });
    }

    const prompt = COMBINED_CONCEPT_PROMPT
      .replace(/\[CONCEPT\]/g, concept)
      .replace('[PROBLEM_CONTEXT]', problemContext || 'general STEM problem');

    const response = await createAnthropicMessage(
      MODEL,
      1000,
      [{ role: 'user', content: prompt + concept }]
    );

    const conceptData = parseJsonResponse(response.content[0].text) || {};

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

// Health check endpoint
app.get('/api/health', (_, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});