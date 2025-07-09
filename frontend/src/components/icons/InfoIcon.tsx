import React from 'react';

interface InfoIconProps {
  className?: string;
  size?: number;
}

const InfoIcon: React.FC<InfoIconProps> = ({ className = '', size = 16 }) => {
  const defaultStyles = className.includes('relation-icon') ? {
    width: '16px',
    height: '16px',
    flexShrink: 0,
    color: '#CC8854'
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
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  );
};

export default InfoIcon;