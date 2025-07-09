import React from 'react';

interface CompassIconProps {
  className?: string;
  size?: number;
}

const CompassIcon: React.FC<CompassIconProps> = ({ className = '', size = 24 }) => {
  const defaultStyles = className.includes('compass-icon') ? {
    width: '16px',
    height: '16px',
    color: '#787575'
  } : {};

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
      style={defaultStyles}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
    </svg>
  );
};

export default CompassIcon;