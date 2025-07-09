import React from 'react';

interface ChevronProps {
  className?: string;
  size?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  expanded?: boolean;
}

const Chevron: React.FC<ChevronProps> = ({ className = '', size = 16, direction = 'down', expanded = false }) => {
  const getRotation = () => {
    let baseRotation = 0;
    switch (direction) {
      case 'up': baseRotation = 180; break;
      case 'left': baseRotation = 90; break;
      case 'right': baseRotation = -90; break;
      case 'down':
      default: baseRotation = 0; break;
    }
    
    // Add 180 degrees if expanded (for expandable cards and relation buttons)
    if (expanded) {
      baseRotation += 180;
    }
    
    return `rotate(${baseRotation}deg)`;
  };

  const getDefaultStyles = () => {
    const baseStyles = {
      transform: getRotation(),
      transition: 'transform 0.2s ease'
    };

    if (className.includes('expandable-card-icon')) {
      return {
        ...baseStyles,
        color: '#787575'
      };
    }

    if (className.includes('relation-chevron')) {
      return {
        ...baseStyles,
        width: '16px',
        height: '16px'
      };
    }

    return baseStyles;
  };

  return (
    <svg 
      className={className}
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={getDefaultStyles()}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
};

export default Chevron;