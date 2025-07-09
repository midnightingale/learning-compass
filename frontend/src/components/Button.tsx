import './Button.css';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, icon: Icon, style }) => {
  return (
    <button
      onClick={onClick}
      style={style}
      className="button"
    >
      {Icon && <Icon className="button-icon" />}
      {children}
    </button>
  );
};

export default Button;