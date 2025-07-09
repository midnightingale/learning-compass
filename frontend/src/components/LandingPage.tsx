import TextInput from './TextInput';
import Button from './Button';
import { CompassIcon } from './icons';
import './LandingPage.css';

interface LandingPageProps {
  onStartChat: (initialMessage?: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartChat }) => {
  const handleSubmit = (message: string) => {
    onStartChat(message);
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
            <CompassIcon className="compass-icon" size={128} />
            Learning Compass
          </h1>
          <p>complex problems into simple solutions</p>
        </div>
        
        <div className="chat-form">
          <TextInput
            onSubmit={handleSubmit}
            placeholder="how can I help?"
            rows={3}
            autoResize={false}
            clearOnSubmit={false}
          />
        </div>

        <div className="sample-questions">
          <h3>Sample Problems</h3>
          <div className="question-buttons">
            {sampleQuestions.map((question, index) => (
              <Button
                key={index}
                onClick={() => {
                  onStartChat(question);
                }}
                style={{ width: '100%' }}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;