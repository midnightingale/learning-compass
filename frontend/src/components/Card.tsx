import './Card.css';

interface CardProps {
  children: React.ReactNode;
  variant?: 'light' | 'white';
}

const Card: React.FC<CardProps> = ({ children, variant = 'light' }) => {
  return (
    <div className={`card card-${variant}`}>
      {children}
    </div>
  );
};

export default Card;