import { type QuestionAnalysis, ApiError } from './api-types';

/**
 * Process Server-Sent Events data lines
 * 
 * SSE format: "data: {JSON}\n"
 * This function:
 * 1. Checks if line starts with "data: " (SSE format)
 * 2. Parses the JSON payload after "data: "
 * 3. Routes different event types to appropriate callbacks
 * 4. Returns true if stream should end (end/error events)
 * 
 * @param line - Raw line from the stream
 * @param callbacks - Event handlers for different message types
 * @returns boolean - Whether to end stream processing
 */
export const handleSSEMessage = (
  line: string,
  callbacks: {
    onContent: (text: string) => void;
    onEnd: () => void;
    onError: (error: string) => void;
    onAnalysis?: (analysis: QuestionAnalysis) => void;
  }
): boolean => {
  // Only process Server-Sent Event data lines
  if (!line.startsWith('data: ')) {
    return false;
  }

  try {
    // Parse JSON payload after "data: " prefix
    const data = JSON.parse(line.slice(6));
    
    // Route different event types to appropriate callbacks
    switch (data.type) {
      case 'analysis':
        if (callbacks.onAnalysis) {
          callbacks.onAnalysis(data.analysis);
        }
        break;
      case 'content':
        callbacks.onContent(data.text);
        break;
      case 'end':
        callbacks.onEnd();
        return true; // Signal to end processing
      case 'error':
        callbacks.onError(data.message);
        return true; // Signal to end processing
      default:
        // Unknown event type, ignore
        break;
    }
  } catch {
    // Ignore invalid JSON
  }

  return false;
};

/**
 * Process SSE stream line by line
 * 
 * Handles the complexity of streaming HTTP responses where data arrives in chunks
 * that may not align with line boundaries. This function:
 * 1. Reads chunks of bytes from the stream
 * 2. Decodes bytes to text and accumulates in a buffer
 * 3. Splits buffer into lines when newlines are found
 * 4. Processes complete lines, keeping incomplete ones buffered
 * 5. Continues until stream ends or processing signals to stop
 * 
 * Example of why buffering is needed:
 * Chunk 1: "data: {\"type\":\"cont"
 * Chunk 2: "ent\",\"text\":\"Hello\"}\n"
 * Without buffering, we'd try to parse incomplete JSON
 * 
 * @param reader - ReadableStream reader for the HTTP response
 * @param callbacks - Event handlers for different message types
 */
export const bufferStreamLines = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  callbacks: {
    onContent: (text: string) => void;
    onEnd: () => void;
    onError: (error: string) => void;
    onAnalysis?: (analysis: QuestionAnalysis) => void;
  }
): Promise<void> => {
  const decoder = new TextDecoder();
  let buffer = '';
  
  // Read chunks until stream is done
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    // Decode bytes to text and add to buffer
    buffer += decoder.decode(value, { stream: true });
    
    // Split into lines at newline characters
    const lines = buffer.split('\n');
    
    // Keep the last line in the buffer in case it's incomplete
    // (no newline at the end means more data is coming)
    buffer = lines.pop() || '';
    
    // Process each complete line
    for (const line of lines) {
      const shouldEnd = handleSSEMessage(line, callbacks);
      if (shouldEnd) {
        return; // End processing early if stream signals completion
      }
    }
  }
};

// Common utilities for API requests
export const handleApiError = (error: unknown, defaultMessage: string): never => {
  if (error instanceof ApiError) {
    throw error;
  }
  
  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw new ApiError('Unable to connect to server. Please check if the backend is running.');
  }
  
  throw new ApiError(defaultMessage);
};

export const makeRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `Request failed with status ${response.status}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    return handleApiError(error, 'An unexpected error occurred.');
  }
};

export const handleStreamResponse = async (
  endpoint: string,
  body: Record<string, unknown>,
  callbacks: {
    onContent: (text: string) => void;
    onEnd: () => void;
    onError: (error: string) => void;
    onAnalysis?: (analysis: QuestionAnalysis) => void;
  }
): Promise<void> => {
  const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...body, stream: true }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `Request failed with status ${response.status}`,
        response.status
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new ApiError('Failed to get response stream');
    }

    await bufferStreamLines(reader, callbacks);
  } catch (error) {
    if (error instanceof ApiError) {
      callbacks.onError(error.message);
      return;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      callbacks.onError('Unable to connect to server. Please check if the backend is running.');
      return;
    }
    
    callbacks.onError('An unexpected error occurred while processing the stream.');
  }
};