import { useCallback } from 'react';
import { apiService } from '../../services/api';
import { type ConceptCardData } from '../ConceptCard';

export const useConceptCardLoader = (
  conceptCards: ConceptCardData[],
  setConceptCards: React.Dispatch<React.SetStateAction<ConceptCardData[]>>,
  problemSummary?: string
) => {
  const addConceptCard = useCallback(async (concept: string) => {
    // Check if concept card already exists
    const existingCard = conceptCards.find(card => card.concept.toLowerCase() === concept.toLowerCase());
    if (existingCard) {
      // Move to top of the list
      setConceptCards(prev => [existingCard, ...prev.filter(card => card.id !== existingCard.id)]);
      return;
    }

    // Create optimistic loading card immediately
    const loadingCard: ConceptCardData = {
      id: Date.now().toString(),
      concept,
      explanation: '',
      relation: '',
      isLoading: true
    };

    // Add loading card to top of concept cards
    setConceptCards(prev => [loadingCard, ...prev]);

    try {
      // Fetch content using combined API
      const response = await apiService.explainConceptCombined(concept, problemSummary);
      
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
  }, [conceptCards, setConceptCards, problemSummary]);

  return addConceptCard;
};