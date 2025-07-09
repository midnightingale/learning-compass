import { useState } from 'react';
import type { Message } from '../types/message';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Sidebar from './Sidebar';
import type { QuestionAnalysis } from '../services/api-types';
import { BackIcon, CompassIcon } from './icons';
import './ChatInterface.css';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onClearError?: () => void;
  onBackToLanding?: () => void;
  analysis?: QuestionAnalysis | null;
  resetTrigger?: number;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading = false, 
  error, 
  onClearError,
  onBackToLanding,
  analysis,
  resetTrigger = 0
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const currentTopic = analysis?.title || 'Problem Analysis';

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
                <BackIcon />
              </button>
              <div className="current-topic">{currentTopic}</div>
            </div>
            <div className="header-right">
              {!isSidebarOpen && (
                <button className="header-button toggle-button" onClick={toggleSidebar}>
                  <CompassIcon size={16} />
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
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} analysis={analysis || null} resetTrigger={resetTrigger} />
    </div>
  );
};

export default ChatInterface;