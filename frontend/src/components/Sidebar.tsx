import { useState, useEffect } from 'react';
import Card from './Card';
import ExpandableCard from './ExpandableCard';
import AddButton from './AddButton';
import Formula from './Formula';
import LoadingIndicator from './LoadingIndicator';
import HighlightedText from './HighlightedText';
import { apiService } from '../services/api';
import { setGlobalConceptHandler } from '../utils/conceptHandler';
import { parseHighlightedText } from '../utils/textParser';
import type { QuestionAnalysis, FormulaCategory } from '../services/api';
import './Sidebar.css';

interface ConceptCard {
  id: string;
  concept: string;
  explanation: string;
  relation?: string;
  showRelation: boolean;
  isLoading?: boolean;
}

interface FormulaCard {
  id: string;
  categoryId: string;
  title: string;
  formula: string;
  variables: Array<{
    symbol: string;
    name: string;
    description: string;
  }>;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: QuestionAnalysis | null;
  onConceptClick?: (concept: string) => void;
  resetTrigger?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, analysis, resetTrigger = 0 }) => {
  const [showGoal, setShowGoal] = useState(false);
  const [showQuantities, setShowQuantities] = useState(false);
  const [cardOrder, setCardOrder] = useState<string[]>([]);
  const [conceptCards, setConceptCards] = useState<ConceptCard[]>([]);
  
  // Cheat sheet state
  const [formulaCategories, setFormulaCategories] = useState<FormulaCategory[]>([]);
  const [formulaCards, setFormulaCards] = useState<FormulaCard[]>([]);

  // Reset all state when resetTrigger changes
  useEffect(() => {
    if (resetTrigger > 0) {
      setShowGoal(false);
      setShowQuantities(false);
      setCardOrder([]);
      setConceptCards([]);
      setFormulaCategories([]);
      setFormulaCards([]);
    }
  }, [resetTrigger]);

  // Set up global concept handler
  useEffect(() => {
    setGlobalConceptHandler(handleConceptClick);
  }, []);
  
  // Set formula categories when analysis changes
  useEffect(() => {
    if (analysis?.formulas) {
      const categories = analysis.formulas.map((formula, index) => ({
        id: formula.title.toLowerCase().replace(/\s+/g, '-'),
        name: formula.title
      }));
      setFormulaCategories(categories);
    }
  }, [analysis?.formulas]);
  
  const handleAddFormula = (categoryId: string, categoryName: string) => {
    // Check if we already have this formula card
    const existingCard = formulaCards.find(card => card.categoryId === categoryId);
    
    if (existingCard) {
      // Move to top of the list
      setFormulaCards(prev => [existingCard, ...prev.filter(card => card.id !== existingCard.id)]);
      return;
    }
    
    // Find the formula from analysis data
    const formula = analysis?.formulas.find(f => 
      f.title.toLowerCase().replace(/\s+/g, '-') === categoryId
    );
    
    if (formula) {
      const newCard: FormulaCard = {
        id: Date.now().toString(),
        categoryId,
        title: formula.title,
        formula: formula.formula,
        variables: formula.variables
      };
      
      // Add to top of formula cards
      setFormulaCards(prev => [newCard, ...prev]);
      
      // Remove the button from available categories
      setFormulaCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }
  };
  

  const handleConceptClick = async (concept: string) => {
    // Check if concept card already exists
    const existingCard = conceptCards.find(card => card.concept.toLowerCase() === concept.toLowerCase());
    if (existingCard) {
      // Move to top of the list
      setConceptCards(prev => [existingCard, ...prev.filter(card => card.id !== existingCard.id)]);
      return;
    }

    // Create optimistic loading card immediately
    const loadingCard: ConceptCard = {
      id: Date.now().toString(),
      concept,
      explanation: '',
      relation: '',
      showRelation: false,
      isLoading: true
    };

    // Add loading card to top of concept cards
    setConceptCards(prev => [loadingCard, ...prev]);

    try {
      // Fetch actual content using combined API
      const response = await apiService.explainConceptCombined(concept, analysis?.problemSummary);
      
      // Update the loading card with actual content
      setConceptCards(prev => prev.map(card => 
        card.id === loadingCard.id 
          ? {
              ...card,
              explanation: response.explanation,
              relation: response.relation,
              isLoading: false
            }
          : card
      ));
    } catch (error) {
      console.error('Error explaining concept:', error);
      // Remove the loading card on error
      setConceptCards(prev => prev.filter(card => card.id !== loadingCard.id));
    }
  };

  const handleRelationClick = (cardId: string) => {
    // Simply toggle the visibility since we already have the relation data
    setConceptCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, showRelation: !c.showRelation } : c
    ));
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">
          <svg className="compass-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
          </svg>
          <h3>Learning Compass</h3>
        </div>
        <button className="sidebar-close" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="sidebar-content">
        <div className="section">
          <div className="section-header-static">
            OVERVIEW
          </div>
          
          {analysis && (
            <Card>
              <p className="problem-summary">{analysis.problemSummary}</p>
            </Card>
          )}
          
          {cardOrder.map((cardType) => {
            if (cardType === 'goal' && analysis?.goal && showGoal) {
              return (
                <ExpandableCard 
                  key="goal"
                  title="Goal" 
                  defaultExpanded={true}
                >
                  <p>{analysis.goal}</p>
                </ExpandableCard>
              );
            }
            if (cardType === 'quantities' && analysis && analysis.quantities?.length > 0 && showQuantities) {
              return (
                <ExpandableCard 
                  key="quantities"
                  title="Quantities" 
                  defaultExpanded={true}
                >
                  <ul className="quantities-list">
                    {analysis.quantities.map((quantity, index) => (
                      <li key={index} className="quantity-item">
                        {quantity}
                      </li>
                    ))}
                  </ul>
                </ExpandableCard>
              );
            }
            return null;
          })}
          
          {analysis && (analysis.quantities?.length > 0 || analysis.goal) && (
            <div className="overview-buttons">
              {analysis.quantities?.length > 0 && !showQuantities && (
                <AddButton 
                  onClick={() => {
                    setShowQuantities(true);
                    setCardOrder(prev => [...prev, 'quantities']);
                  }} 
                >
                  Quantities
                </AddButton>
              )}
              {analysis.goal && !showGoal && (
                <AddButton 
                  onClick={() => {
                    setShowGoal(true);
                    setCardOrder(prev => [...prev, 'goal']);
                  }} 
                >
                  Goal
                </AddButton>
              )}
            </div>
          )}
          
        </div>

        {(formulaCards.length > 0 || formulaCategories.length > 0) && (
          <div className="section">
            <div className="section-header-static">
              CHEAT SHEET
            </div>

            {/* Formula Cards - shown above buttons */}
            {formulaCards.map(card => (
              <ExpandableCard 
                key={card.id} 
                title={card.title}
                variant="white"
                defaultExpanded={true}
              >
                <Formula 
                  formula={card.formula} 
                  variables={card.variables} 
                  onConceptClick={handleConceptClick}
                />
              </ExpandableCard>
            ))}

            {/* Formula Category Buttons */}
            {formulaCategories.length > 0 && (
              <div className="formula-categories">
                {formulaCategories.map(category => (
                  <AddButton 
                    key={category.id}
                    onClick={() => handleAddFormula(category.id, category.name)}
                  >
                    {category.name}
                  </AddButton>
                ))}
              </div>
            )}
          </div>
        )}

        {conceptCards.length > 0 && (
          <div className="section">
            <div className="section-header-static">
              CONCEPTS
            </div>
            
            {conceptCards.map((card) => (
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
                          onClick={() => handleConceptClick(segment.text)}
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
                    onClick={() => handleRelationClick(card.id)}
                  >
                    🔍 How does this relate?
                  </button>
                )}
                
                {card.showRelation && card.relation && (
                  <div className="relation-content">
                    <p>{card.relation}</p>
                  </div>
                )}
              </div>
            </ExpandableCard>
          ))}
            
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;