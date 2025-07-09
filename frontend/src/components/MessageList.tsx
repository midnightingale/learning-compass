import { useEffect, useRef } from 'react';
import type { Message } from '../types/message';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import './MessageList.css';

interface MessageListProps {
  messages: Message[];
  onFirstMessage: () => void;
  isLoading?: boolean;
  error?: string | null;
  onClearError?: () => void;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  onFirstMessage, 
  isLoading = false, 
  error, 
  onClearError 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length === 1) {
      onFirstMessage();
    }
  }, [messages.length, onFirstMessage]);

  if (messages.length === 0) {
    return <div className="message-list empty"></div>;
  }

  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} />
      ))}
      
      {isLoading && <LoadingIndicator />}
      
      {error && (
        <div className="error-message">
          <span>{error}</span>
          {onClearError && (
            <button onClick={onClearError} className="error-dismiss">
              ×
            </button>
          )}
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;