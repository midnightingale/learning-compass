import React from 'react';
import './HighlightedText.css';

interface HighlightedTextProps {
  text: string;
  onClick: () => void;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, onClick }) => {
  return (
    <button 
      className="highlighted-text"
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default HighlightedText;