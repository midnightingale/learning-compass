import { useState, useCallback } from 'react';
import type { Message } from '../types/message';
import { apiService } from '../services/api';
import type { QuestionAnalysis } from '../services/api-types';
import { ApiError } from '../services/api-types';

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  analysis: QuestionAnalysis | null;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
  clearAnalysis: () => void;
  setMessages: (messages: Message[]) => void;
}

// Constants for message array operations
const REMOVE_LAST_MESSAGE = -1;
const REMOVE_LAST_TWO_MESSAGES = -2;

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<QuestionAnalysis | null>(null);

  const handleStreamingUpdate = useCallback((text: string) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage?.type === 'assistant') {
        newMessages[newMessages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + text
        };
      }
      return newMessages;
    });
  }, []);

  const handleError = useCallback((errorMessage: string, removeMessages: number = REMOVE_LAST_MESSAGE) => {
    setError(errorMessage);
    setMessages(prev => prev.slice(0, removeMessages));
    setIsLoading(false);
  }, []);

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

    // Create placeholder assistant message for streaming
    const assistantMessage: Message = {
      type: 'assistant',
      content: ''
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Use initial endpoint for first message (when no previous messages)
      if (messages.length === 0) {
        await apiService.sendInitialMessageStream(
          content.trim(),
          handleStreamingUpdate,
          (analysisData: QuestionAnalysis) => {
            console.log('Initial response analysis:', analysisData);
            setAnalysis(analysisData);
          },
          () => {
            setIsLoading(false);
          },
          (errorMessage: string) => {
            handleError(errorMessage, REMOVE_LAST_MESSAGE);
          }
        );
      } else {
        await apiService.sendMessageStream(
          {
            message: content.trim(),
            conversation: messages
          },
          handleStreamingUpdate,
          () => {
            setIsLoading(false);
          },
          (errorMessage: string) => {
            handleError(errorMessage, REMOVE_LAST_MESSAGE);
          }
        );
      }
    } catch (err) {
      let errorMessage = 'Failed to send message';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
      }
      
      handleError(errorMessage, REMOVE_LAST_TWO_MESSAGES);
    }
  }, [messages, isLoading, handleStreamingUpdate, handleError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    analysis,
    sendMessage,
    clearError,
    clearAnalysis,
    setMessages
  };
};