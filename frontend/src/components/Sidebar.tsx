import { useState, useEffect } from 'react';
import ExpandableCard from './ExpandableCard';
import Button from './Button';
import ConceptCard, { type ConceptCardData } from './ConceptCard';
import FormulaCard, { type FormulaCard as FormulaCardType } from './FormulaCard';
import SectionHeader from './SectionHeader';
import { setGlobalConceptHandler } from '../utils/conceptHandler';
import { useConceptCardLoader } from './hooks/useConceptCardLoader';
import { useFormulaCardLoader } from './hooks/useFormulaCardLoader';
import type { QuestionAnalysis, FormulaCategory } from '../services/api-types';
import { CompassIcon, CloseIcon, AddIcon } from './icons';
import './Sidebar.css';


interface OverviewCard {
  id: string;
  type: 'goal' | 'quantities';
  title: string;
  content: string | string[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: QuestionAnalysis | null;
  onConceptClick?: (concept: string) => void;
  resetTrigger?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, analysis, resetTrigger = 0 }) => {
  const [overviewCards, setOverviewCards] = useState<OverviewCard[]>([]);
  const [overviewCategories, setOverviewCategories] = useState<{id: string, name: string, type: 'goal' | 'quantities'}[]>([]);
  const [availableFormulas, setAvailableFormulas] = useState<FormulaCategory[]>([]);
  const [formulaCards, setFormulaCards] = useState<FormulaCardType[]>([]);
  const [conceptCards, setConceptCards] = useState<ConceptCardData[]>([]);

  // Reset all state when resetTrigger changes
  useEffect(() => {
    if (resetTrigger > 0) {
      setOverviewCards([]);
      setOverviewCategories([]);
      setConceptCards([]);
      setAvailableFormulas([]);
      setFormulaCards([]);
    }
  }, [resetTrigger]);

  // Set overview categories when analysis is returned
  useEffect(() => {
    if (analysis) {
      const categories = [];
      if (analysis.goal) {
        categories.push({ id: 'goal', name: 'Goal', type: 'goal' as const });
      }
      if (analysis.quantities && analysis.quantities.length > 0) {
        categories.push({ id: 'quantities', name: 'Quantities', type: 'quantities' as const });
      }
      setOverviewCategories(categories);
    }
  }, [analysis]);

  // Set formulas when analysis is returned
  useEffect(() => {
    if (analysis?.formulas) {
      const formulas = analysis.formulas.map((formula) => ({
        id: formula.title.toLowerCase().replace(/\s+/g, '-'),
        name: formula.title
      }));
      setAvailableFormulas(formulas);
    }
  }, [analysis?.formulas]);
  
  // Card reveal handlers
  const handleAddOverview = (categoryId: string) => {
    // Find the category from available categories
    const category = overviewCategories.find(cat => cat.id === categoryId);
    
    if (category && analysis) {
      const newCard: OverviewCard = {
        id: categoryId,
        type: category.type,
        title: category.name,
        content: category.type === 'goal' ? analysis.goal || '' : analysis.quantities || []
      };
      
      // Add to end of overview cards
      setOverviewCards(prev => [...prev, newCard]);
      
      // Remove the button from available categories
      setOverviewCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }
  };
  
  const showFormula = useFormulaCardLoader(setFormulaCards, setAvailableFormulas, analysis);
  const addConceptCard = useConceptCardLoader(conceptCards, setConceptCards, analysis?.problemSummary);

  // Set up global concept click handler
  useEffect(() => {
    setGlobalConceptHandler(addConceptCard);
  }, [addConceptCard]);

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">
          <CompassIcon className="compass-icon" />
          <h3>Learning Compass</h3>
        </div>
        <button className="sidebar-close" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      
      <div className="sidebar-content">
        <div className="section">
          <SectionHeader text="OVERVIEW" />
          
          {analysis && (
            <ExpandableCard 
              title="Summary" 
              defaultExpanded={true}
            >
              <p>{analysis.problemSummary}</p>
            </ExpandableCard>
          )}
          
          {overviewCards.map((card) => (
            <ExpandableCard 
              key={card.id}
              title={card.title} 
              defaultExpanded={true}
            >
              {card.type === 'goal' ? (
                <p>{card.content as string}</p>
              ) : (
                <ul className="quantities-list">
                  {(card.content as string[]).map((quantity, index) => (
                    <li key={index}>
                      {quantity}
                    </li>
                  ))}
                </ul>
              )}
            </ExpandableCard>
          ))}
          
          {overviewCategories.length > 0 && (
            <div className="button-list">
              {overviewCategories.map(category => (
                <Button 
                  key={category.id}
                  onClick={() => handleAddOverview(category.id)}
                  icon={AddIcon}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}
          
        </div>

        {(formulaCards.length > 0 || availableFormulas.length > 0) && (
          <div className="section">
            <SectionHeader text="CHEAT SHEET" />

            {formulaCards.map(card => (
              <FormulaCard 
                key={card.id}
                card={card}
                onConceptClick={addConceptCard}
              />
            ))}

            {availableFormulas.length > 0 && (
              <div className="button-list ">
                {availableFormulas.map(formula => (
                  <Button 
                    key={formula.id}
                    onClick={() => showFormula(formula.id)}
                    icon={AddIcon}
                  >
                    {formula.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {conceptCards.length > 0 && (
          <div className="section">
            <SectionHeader text="CONCEPTS" />
            
            {conceptCards.map((card) => (
              <ConceptCard 
                key={card.id}
                card={card}
                onConceptClick={addConceptCard}
              />
            ))}
            
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;