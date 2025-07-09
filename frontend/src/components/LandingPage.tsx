import { useState } from 'react';
import SendButton from './SendButton';
import './LandingPage.css';

interface LandingPageProps {
  onStartChat: (initialMessage?: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartChat }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onStartChat(input.trim());
    }
  };

  const sampleQuestions = [
    "a ball is thrown upward at 20 m/s. when does it hit the ground?",
    "how many grams of NaCl are needed to make 500 mL of 0.2 M solution?",
    "find the growth rate of a population that grows from 1000 to 1500 in 5 years"
  ];

  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="header">
          <h1>
            <svg className="compass-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
            learning compass
          </h1>
          <p>complex problems into simple solutions</p>
        </div>
        
        <form onSubmit={handleSubmit} className="chat-form">
          <div className="input-container">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="how can I help?"
              rows={3}
              className="chat-input"
            />
            <SendButton type="submit" disabled={!input.trim()} />
          </div>
        </form>

        <div className="sample-questions">
          <h3>Sample Problems</h3>
          <div className="question-buttons">
            {sampleQuestions.map((question, index) => (
              <button
                key={index}
                className="sample-question"
                onClick={() => {
                  onStartChat(question);
                }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;