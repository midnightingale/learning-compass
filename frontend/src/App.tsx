import { useState } from 'react';
import type { Message } from './types/message';
import ChatInterface from './components/ChatInterface';
import LandingPage from './components/LandingPage';
import { useChat } from './hooks/useChat';
import './App.css';

function App() {
  const [showChat, setShowChat] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const { messages, isLoading, error, analysis, sendMessage, clearError, clearAnalysis, setMessages } = useChat();

  const handleStartChat = async (initialMessage?: string) => {
    setShowChat(true);
    if (initialMessage) {
      await sendMessage(initialMessage);
    }
  };

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  const handleBackToLanding = () => {
    setShowChat(false);
    setMessages([]);
    clearError();
    clearAnalysis();
    setResetTrigger(prev => prev + 1);
  };

  return (
    <div className="app">
      {!showChat ? (
        <LandingPage onStartChat={handleStartChat} />
      ) : (
        <ChatInterface 
          messages={messages} 
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          error={error}
          onClearError={clearError}
          onBackToLanding={handleBackToLanding}
          analysis={analysis}
          resetTrigger={resetTrigger}
        />
      )}
    </div>
  );
}

export default App;