import { SendIcon } from './icons';
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
      <SendIcon />
    </button>
  );
};

export default SendButton;