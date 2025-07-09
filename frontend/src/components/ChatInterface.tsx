import { useState } from 'react';
import type { Message } from '../types/message';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Sidebar from './Sidebar';
import type { QuestionAnalysis } from '../services/api';
import './ChatInterface.css';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onClearError?: () => void;
  onBackToLanding?: () => void;
  analysis?: QuestionAnalysis | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading = false, 
  error, 
  onClearError,
  onBackToLanding,
  analysis
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTopic] = useState('Physics - Rotational Motion');

  // Input handling is done in MessageInput component

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleFirstMessage = () => {
    if (messages.length === 1 && !isSidebarOpen) {
      setIsSidebarOpen(true);
    }
  };

  return (
    <div className="chat-interface">
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="chat-container">
          <div className="chat-header">
            <div className="header-left">
              <button className="header-button back-button" onClick={onBackToLanding}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 19-7-7 7-7"></path>
                  <path d="M19 12H5"></path>
                </svg>
              </button>
              <div className="current-topic">{currentTopic}</div>
            </div>
            <div className="header-right">
              {!isSidebarOpen && (
                <button className="header-button toggle-button" onClick={toggleSidebar}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                  </svg>
                  Compass
                </button>
              )}
            </div>
          </div>
          <MessageList 
            messages={messages} 
            onFirstMessage={handleFirstMessage} 
            isLoading={isLoading}
            error={error}
            onClearError={onClearError}
          />
          <MessageInput 
            onSendMessage={onSendMessage} 
            isLoading={isLoading}
          />
        </div>
      </div>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} analysis={analysis || null} />
    </div>
  );
};

export default ChatInterface;