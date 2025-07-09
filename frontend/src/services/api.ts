import type { Message } from '../types/message';
import type { Variable } from '../components/Formula';

const API_BASE_URL = 'http://localhost:3001/api';

export interface QuestionAnalysis {
  title: string;
  quantities: string[];
  goal: string | null;
  problemSummary: string;
  formulas: Array<{
    title: string;
    formula: string;
    variables: Array<{
      symbol: string;
      name: string;
      description: string;
    }>;
  }>;
}

export interface ChatResponse {
  message: string;
  success: boolean;
}

export interface InitialChatResponse extends ChatResponse {
  analysis: QuestionAnalysis;
}

export interface ConceptExplanationResponse {
  explanation: string;
  success: boolean;
}

export interface ConceptRelationResponse {
  relation: string;
  success: boolean;
}

export interface CombinedConceptResponse {
  explanation: string;
  relation: string;
  success: boolean;
}

export interface FormulaCategory {
  id: string;
  name: string;
}

export interface FormulaResponse {
  title: string;
  formula: string;
  variables: Variable[];
  success: boolean;
}

export interface ChatRequest {
  message: string;
  conversation?: Message[];
}

export class ApiError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const apiService = {
  async sendInitialMessage(message: string): Promise<InitialChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/initial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Request failed with status ${response.status}`,
          response.status
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError('Unable to connect to server. Please check if the backend is running.');
      }
      
      throw new ApiError('An unexpected error occurred while sending the message.');
    }
  },

  async sendInitialMessageStream(
    message: string,
    onContent: (text: string) => void,
    onAnalysis: (analysis: QuestionAnalysis) => void,
    onEnd: () => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/initial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, stream: true }),
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

      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last line in the buffer in case it's incomplete
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'analysis') {
                onAnalysis(data.analysis);
              } else if (data.type === 'content') {
                onContent(data.text);
              } else if (data.type === 'end') {
                onEnd();
                return;
              } else if (data.type === 'error') {
                onError(data.message);
                return;
              }
            } catch {
              // Ignore invalid JSON
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        onError(error.message);
        return;
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        onError('Unable to connect to server. Please check if the backend is running.');
        return;
      }
      
      onError('An unexpected error occurred while sending the message.');
    }
  },

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Request failed with status ${response.status}`,
          response.status
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError('Unable to connect to server. Please check if the backend is running.');
      }
      
      throw new ApiError('An unexpected error occurred while sending the message.');
    }
  },

  async sendMessageStream(
    request: ChatRequest,
    onContent: (text: string) => void,
    onEnd: () => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...request, stream: true }),
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

      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last line in the buffer in case it's incomplete
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'content') {
                onContent(data.text);
              } else if (data.type === 'end') {
                onEnd();
                return;
              } else if (data.type === 'error') {
                onError(data.message);
                return;
              }
            } catch {
              // Ignore invalid JSON
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        onError(error.message);
        return;
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        onError('Unable to connect to server. Please check if the backend is running.');
        return;
      }
      
      onError('An unexpected error occurred while sending the message.');
    }
  },

  async explainConcept(concept: string, problemContext?: string): Promise<ConceptExplanationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/concept/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ concept, problemContext }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Request failed with status ${response.status}`,
          response.status
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError('Unable to connect to server. Please check if the backend is running.');
      }
      
      throw new ApiError('An unexpected error occurred while explaining the concept.');
    }
  },

  async explainConceptRelation(concept: string, problemContext?: string): Promise<ConceptRelationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/concept/relate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ concept, problemContext }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Request failed with status ${response.status}`,
          response.status
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError('Unable to connect to server. Please check if the backend is running.');
      }
      
      throw new ApiError('An unexpected error occurred while explaining the concept relation.');
    }
  },

  async explainConceptCombined(concept: string, problemContext?: string): Promise<CombinedConceptResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/concept/combined`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ concept, problemContext }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Request failed with status ${response.status}`,
          response.status
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError('Unable to connect to server. Please check if the backend is running.');
      }
      
      throw new ApiError('An unexpected error occurred while explaining the concept.');
    }
  },

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },
  
  async getFormulaCategories(problemContext?: string, resources?: string[]): Promise<FormulaCategory[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/formulas/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problemContext, resources }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Request failed with status ${response.status}`,
          response.status
        );
      }

      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError('Unable to connect to server. Please check if the backend is running.');
      }
      
      throw new ApiError('An unexpected error occurred while fetching formula categories.');
    }
  },
  
  async getFormulas(categoryId: string, problemContext?: string): Promise<FormulaResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/formulas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryId, problemContext }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `Request failed with status ${response.status}`,
          response.status
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError('Unable to connect to server. Please check if the backend is running.');
      }
      
      throw new ApiError('An unexpected error occurred while fetching formulas.');
    }
  }
};