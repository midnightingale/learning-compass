import { useState, useRef, useEffect } from 'react';
import SendButton from './SendButton';
import './TextInput.css';

interface TextInputProps {
  onSubmit: (content: string) => Promise<void> | void;
  placeholder?: string;
  isLoading?: boolean;
  autoResize?: boolean;
  rows?: number;
  clearOnSubmit?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ 
  onSubmit, 
  placeholder = "Type your message...", 
  isLoading = false,
  autoResize = false,
  rows = 1,
  clearOnSubmit = false
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize the textarea based on content
  useEffect(() => {
    if (autoResize) {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }
  }, [input, autoResize]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      const message = input.trim();
      if (clearOnSubmit) {
        setInput('');
      }
      await onSubmit(message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="text-input-form">
      <div className="input-container">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className="text-input"
          disabled={isLoading}
          rows={autoResize ? 1 : rows}
        />
        <SendButton type="submit" disabled={!input.trim() || isLoading} />
      </div>
    </form>
  );
};

export default TextInput;