import { useState } from 'react';
import './ExpandableCard.css';

interface ExpandableCardProps {
  title: string;
  children: React.ReactNode;
  variant?: 'light' | 'white';
  defaultExpanded?: boolean;
}

const ExpandableCard: React.FC<ExpandableCardProps> = ({ 
  title, 
  children, 
  variant = 'light',
  defaultExpanded = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`expandable-card expandable-card-${variant}`}>
      <button 
        className="expandable-card-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="expandable-card-title">{title}</span>
        <svg 
          className={`expandable-card-icon ${isExpanded ? 'expanded' : ''}`}
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
      </button>
      {isExpanded && (
        <div className="expandable-card-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default ExpandableCard;