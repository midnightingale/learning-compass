import React from 'react';

interface AddIconProps {
  className?: string;
  size?: number;
}

const AddIcon: React.FC<AddIconProps> = ({ className = '', size = 16 }) => {
  const defaultStyles = className.includes('add-button-icon') ? {
    width: '16px',
    height: '16px',
    flexShrink: 0
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
      <path d="M5 12h14"></path>
      <path d="M12 5v14"></path>
    </svg>
  );
};

export default AddIcon;