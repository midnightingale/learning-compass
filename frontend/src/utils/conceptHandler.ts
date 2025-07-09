// Global concept click handler
let globalConceptHandler: ((concept: string) => void) | null = null;

export const setGlobalConceptHandler = (handler: (concept: string) => void) => {
  globalConceptHandler = handler;
};

export const handleConceptClick = (concept: string) => {
  if (globalConceptHandler) {
    globalConceptHandler(concept);
  }
};