import { useState, useCallback } from 'react';
import type { Message } from '../types/message';
import { apiService, ApiError } from '../services/api';
import type { QuestionAnalysis } from '../services/api';

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  analysis: QuestionAnalysis | null;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
  setMessages: (messages: Message[]) => void;
}

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<QuestionAnalysis | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      type: 'user',
      content: content.trim()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      let response;
      
      // Use initial endpoint for first message (when no previous messages)
      if (messages.length === 0) {
        const initialResponse = await apiService.sendInitialMessage(content.trim());
        console.log('Initial response analysis:', initialResponse.analysis);
        setAnalysis(initialResponse.analysis);
        response = { message: initialResponse.message };
      } else {
        response = await apiService.sendMessage({
          message: content.trim(),
          conversation: messages
        });
      }

      const assistantMessage: Message = {
        type: 'assistant',
        content: response.message
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      let errorMessage = 'Failed to send message';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Remove the user message if the API call failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    analysis,
    sendMessage,
    clearError,
    setMessages
  };
};