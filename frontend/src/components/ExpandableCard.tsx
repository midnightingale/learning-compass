import { useState } from 'react';
import { Chevron } from './icons';
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
        <Chevron className="expandable-card-icon" expanded={isExpanded} />
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