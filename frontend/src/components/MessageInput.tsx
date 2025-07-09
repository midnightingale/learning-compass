import TextInput from './TextInput';
import './MessageInput.css';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading = false }) => {
  return (
    <div className="message-input-wrapper">
      <TextInput
        onSubmit={onSendMessage}
        placeholder="ask your question or describe what you're working on..."
        isLoading={isLoading}
        autoResize={true}
        clearOnSubmit={true}
      />
    </div>
  );
};

export default MessageInput;