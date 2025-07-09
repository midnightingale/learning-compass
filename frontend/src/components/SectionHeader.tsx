import React from 'react';

interface SectionHeaderProps {
  children?: React.ReactNode;
  text?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ text }) => {
  return (
    <div className="section-header">
      {text}
    </div>
  );
};

export default SectionHeader;