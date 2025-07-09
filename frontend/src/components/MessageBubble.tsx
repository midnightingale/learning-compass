import type { Message } from '../types/message';
import { parseHighlightedText } from '../utils/textParser';
import { handleConceptClick } from '../utils/conceptHandler';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  // Parse message content for highlighted text
  const segments = parseHighlightedText(message.content);

  return (
    <div className={`message-bubble ${message.type}`}>
      <div className="message-content">
        {segments.map((segment, index) => (
          segment.isHighlighted ? (
            <button 
              key={index}
              className="highlighted-text"
              onClick={() => handleConceptClick(segment.text)}
            >
              {segment.text}
            </button>
          ) : (
            <span key={index}>{segment.text}</span>
          )
        ))}
      </div>
    </div>
  );
};

export default MessageBubble;