import { AddIcon } from './icons';
import './AddButton.css';

interface AddButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const AddButton: React.FC<AddButtonProps> = ({ children, onClick }) => {
  return (
    <button className="add-button" onClick={onClick}>
      <AddIcon className="add-button-icon" />
      {children}
    </button>
  );
};

export default AddButton;