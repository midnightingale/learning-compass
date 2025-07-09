import React, { useState } from 'react';
import { handleConceptClick } from '../utils/conceptHandler';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import './FormulaCard.css';

interface Variable {
  symbol: string;
  name: string;
  description: string;
}

interface FormulaCardProps {
  title: string;
  formula: string;
  variables: Variable[];
  onClose?: () => void;
}

const FormulaCard: React.FC<FormulaCardProps> = ({ 
  title, 
  formula, 
  variables,
  onClose
}) => {
  const [hoveredVariable, setHoveredVariable] = useState<string | null>(null);

  // Replace variables in formula with clickable/hoverable spans
  const renderFormula = () => {
    return (
      <div className="formula-display">
        <InlineMath math={formula} />
      </div>
    );
  };

  return (
    <div className="formula-card">
      <div className="formula-card-header">
        <h4>{title}</h4>
        {onClose && (
          <button className="formula-close" onClick={onClose}>
            ×
          </button>
        )}
      </div>
      <div className="formula-content">
        {renderFormula()}
        
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
                onClick={() => handleConceptClick(variable.name)}
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
    </div>
  );
};

export default FormulaCard;
