import ExpandableCard from './ExpandableCard';
import Formula from './Formula';

export interface FormulaCard {
  id: string;
  formulaId: string;
  title: string;
  formula: string;
  variables: Array<{
    symbol: string;
    name: string;
    description: string;
  }>;
}

interface FormulaCardProps {
  card: FormulaCard;
  onConceptClick: (concept: string) => void;
}

const FormulaCard: React.FC<FormulaCardProps> = ({ card, onConceptClick }) => {
  return (
    <ExpandableCard 
      key={card.id} 
      title={card.title}
      variant="white"
      defaultExpanded={true}
    >
      <Formula 
        formula={card.formula} 
        variables={card.variables} 
        onConceptClick={onConceptClick}
      />
    </ExpandableCard>
  );
};

export default FormulaCard;