import type { Message } from '../types/message';
import type { Variable } from '../components/Formula';

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