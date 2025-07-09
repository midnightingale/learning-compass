import { useState } from 'react';
import { InfoIcon, Chevron } from './icons';
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
        <InfoIcon className="relation-icon" />
        {children}
        {relationText && (
          <Chevron className="relation-chevron" expanded={isExpanded} />
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