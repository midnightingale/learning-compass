import { useState } from 'react';
import './RelationButton.css';

interface RelationButtonProps {
  children: React.ReactNode;
  relationText?: string;
}

const RelationButton: React.FC<RelationButtonProps> = ({ children, relationText }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (relationText) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="relation-container">
      <button className="relation-button" onClick={handleClick}>
        <svg 
          className="relation-icon"
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        {children}
        {relationText && (
          <svg 
            className={`relation-chevron ${isExpanded ? 'expanded' : ''}`}
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        )}
      </button>
      {isExpanded && relationText && (
        <div className="relation-content">
          {relationText}
        </div>
      )}
    </div>
  );
};

export default RelationButton;