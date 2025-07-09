import { AddIcon } from './icons';
import './Button.css';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, icon = true, style, className = '' }) => {
  return (
    <button 
      className={`button ${className}`} 
      onClick={onClick}
      style={style}
    >
      {icon && <AddIcon className="button-icon" />}
      {children}
    </button>
  );
};

export default Button;