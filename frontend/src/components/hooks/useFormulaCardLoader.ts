import { useCallback } from 'react';
import { type FormulaCard } from '../FormulaCard';
import type { QuestionAnalysis, FormulaCategory } from '../../services/api-types';

export const useFormulaCardLoader = (
  setFormulaCards: React.Dispatch<React.SetStateAction<FormulaCard[]>>,
  setAvailableFormulas: React.Dispatch<React.SetStateAction<FormulaCategory[]>>,
  analysis?: QuestionAnalysis | null
) => {
  const showFormula = useCallback((formulaId: string) => {
    // Find the formula from analysis data
    const formula = analysis?.formulas.find(f => 
      f.title.toLowerCase().replace(/\s+/g, '-') === formulaId
    );
    
    if (formula) {
      const newCard: FormulaCard = {
        id: Date.now().toString(),
        formulaId,
        title: formula.title,
        formula: formula.formula,
        variables: formula.variables
      };
      
      // Add to end of formula cards
      setFormulaCards(prev => [...prev, newCard]);
      
      // Remove the button from available formulas
      setAvailableFormulas(prev => prev.filter(f => f.id !== formulaId));
    }
  }, [analysis, setFormulaCards, setAvailableFormulas]);

  return showFormula;
};