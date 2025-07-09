import { useState } from 'react';
import ExpandableCard from './ExpandableCard';
import LoadingIndicator from './LoadingIndicator';
import HighlightedText from './HighlightedText';
import { parseHighlightedText } from '../utils/textParser';
import './ConceptCard.css';

export interface ConceptCardData {
  id: string;
  concept: string;
  explanation: string;
  relation?: string;
  isLoading?: boolean;
}

interface ConceptCardProps {
  card: ConceptCardData;
  onConceptClick: (concept: string) => void;
}

const ConceptCard: React.FC<ConceptCardProps> = ({ card, onConceptClick }) => {
  const [showRelation, setShowRelation] = useState(false);

  const handleRelationClick = () => {
    setShowRelation(!showRelation);
  };

  return (
    <ExpandableCard 
      key={card.id}
      title={card.concept}
      variant="white"
      defaultExpanded={true}
    >
      <div className="concept-content">
        <div className="concept-explanation">
          {card.isLoading ? (
            <LoadingIndicator variant="minimal" />
          ) : (
            parseHighlightedText(card.explanation).map((segment, index) => (
              segment.isHighlighted ? (
                <HighlightedText 
                  key={index}
                  text={segment.text}
                  onClick={() => onConceptClick(segment.text)}
                />
              ) : (
                <span key={index}>{segment.text}</span>
              )
            ))
          )}
        </div>
        
        {!card.isLoading && (
          <button 
            className="relation-button"
            onClick={handleRelationClick}
          >
            🔍 How does this relate?
          </button>
        )}
        
        {showRelation && card.relation && (
          <div className="relation-content">
            <p>{card.relation}</p>
          </div>
        )}
      </div>
    </ExpandableCard>
  );
};

export default ConceptCard;