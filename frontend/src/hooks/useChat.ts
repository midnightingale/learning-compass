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
          (text: string) => {
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
          },
          (analysisData: QuestionAnalysis) => {
            console.log('Initial response analysis:', analysisData);
            setAnalysis(analysisData);
          },
          () => {
            setIsLoading(false);
          },
          (errorMessage: string) => {
            setError(errorMessage);
            setMessages(prev => prev.slice(0, -1)); // Remove placeholder assistant message
            setIsLoading(false);
          }
        );
      } else {
        await apiService.sendMessageStream(
          {
            message: content.trim(),
            conversation: messages
          },
          (text: string) => {
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
          },
          () => {
            setIsLoading(false);
          },
          (errorMessage: string) => {
            setError(errorMessage);
            setMessages(prev => prev.slice(0, -1)); // Remove placeholder assistant message
            setIsLoading(false);
          }
        );
      }
    } catch (err) {
      let errorMessage = 'Failed to send message';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Remove both user and placeholder assistant messages
      setMessages(prev => prev.slice(0, -2));
      setIsLoading(false);
    }
  }, [messages, isLoading]);

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