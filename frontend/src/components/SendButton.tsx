import './SendButton.css';

interface SendButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

const SendButton: React.FC<SendButtonProps> = ({ 
  onClick, 
  disabled = false, 
  type = 'button' 
}) => {
  return (
    <button 
      type={type}
      className="send-button-shared"
      onClick={onClick}
      disabled={disabled}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14"></path>
        <path d="m12 5 7 7-7 7"></path>
      </svg>
    </button>
  );
};

export default SendButton;