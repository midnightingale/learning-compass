import React, { useState } from 'react';
import { handleConceptClick } from '../utils/conceptHandler';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import './Formula.css';

export interface Variable {
  symbol: string;
  name: string;
  description: string;
}

interface FormulaProps {
  formula: string;
  variables: Variable[];
  onConceptClick?: (concept: string) => void;
}

const Formula: React.FC<FormulaProps> = ({ formula, variables, onConceptClick }) => {
  const [hoveredVariable, setHoveredVariable] = useState<string | null>(null);

  return (
    <div className="formula-container">
      <div className="formula">
        <InlineMath math={formula} />
      </div>
      
      <div className="variables-list">
        {variables.map((variable) => (
          <div 
            key={variable.symbol} 
            className="variable-item"
            onMouseEnter={() => setHoveredVariable(variable.symbol)}
            onMouseLeave={() => setHoveredVariable(null)}
          >
            <div className="variable-symbol">
              <InlineMath math={variable.symbol} />
            </div>
            <button 
              className="variable-name"
              onClick={() => onConceptClick ? onConceptClick(variable.name) : handleConceptClick(variable.name)}
            >
              {variable.name}
            </button>
            {hoveredVariable === variable.symbol && (
              <div className="variable-tooltip">
                {variable.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Formula;
