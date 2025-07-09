import './LoadingIndicator.css';

interface LoadingIndicatorProps {
  variant?: 'default' | 'minimal';
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ variant = 'default' }) => {
  return (
    <div className={`loading-indicator ${variant === 'minimal' ? 'minimal' : ''}`}>
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
    </div>
  );
};

export default LoadingIndicator;