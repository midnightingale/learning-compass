import {
  type QuestionAnalysis,
  type ChatResponse,
  type InitialChatResponse,
  type ConceptExplanationResponse,
  type ConceptRelationResponse,
  type CombinedConceptResponse,
  type FormulaCategory,
  type FormulaResponse,
  type ChatRequest,
} from './api-types';
import { makeRequest, handleStreamResponse } from './streaming-utils';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

export const apiService = {
  async sendInitialMessage(message: string): Promise<InitialChatResponse> {
    return makeRequest<InitialChatResponse>('/chat/initial', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  async sendInitialMessageStream(
    message: string,
    onContent: (text: string) => void,
    onAnalysis: (analysis: QuestionAnalysis) => void,
    onEnd: () => void,
    onError: (error: string) => void
  ): Promise<void> {
    return handleStreamResponse('/chat/initial', { message }, {
      onContent,
      onAnalysis,
      onEnd,
      onError,
    });
  },

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return makeRequest<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async sendMessageStream(
    request: ChatRequest,
    onContent: (text: string) => void,
    onEnd: () => void,
    onError: (error: string) => void
  ): Promise<void> {
    return handleStreamResponse('/chat', request as unknown as Record<string, unknown>, {
      onContent,
      onEnd,
      onError,
    });
  },

  async explainConcept(concept: string, problemContext?: string): Promise<ConceptExplanationResponse> {
    return makeRequest<ConceptExplanationResponse>('/concept/explain', {
      method: 'POST',
      body: JSON.stringify({ concept, problemContext }),
    });
  },

  async explainConceptRelation(concept: string, problemContext?: string): Promise<ConceptRelationResponse> {
    return makeRequest<ConceptRelationResponse>('/concept/relate', {
      method: 'POST',
      body: JSON.stringify({ concept, problemContext }),
    });
  },

  async explainConceptCombined(concept: string, problemContext?: string): Promise<CombinedConceptResponse> {
    return makeRequest<CombinedConceptResponse>('/concept', {
      method: 'POST',
      body: JSON.stringify({ concept, problemContext }),
    });
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
    const data = await makeRequest<{ categories: FormulaCategory[] }>('/formulas/categories', {
      method: 'POST',
      body: JSON.stringify({ problemContext, resources }),
    });
    return data.categories || [];
  },

  async getFormulas(categoryId: string, problemContext?: string): Promise<FormulaResponse> {
    return makeRequest<FormulaResponse>('/formulas', {
      method: 'POST',
      body: JSON.stringify({ categoryId, problemContext }),
    });
  }
};

