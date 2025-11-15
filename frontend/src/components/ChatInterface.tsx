import { useState } from 'react';

type ChatInterfaceProps = {
  onSubmit: (message: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
};

export const ChatInterface = ({ onSubmit, disabled, placeholder = "Type your message..." }: ChatInterfaceProps) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(message);
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <div className="chat-input-wrapper">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled || isSubmitting}
          className="chat-input"
          rows={1}
          style={{
            resize: 'none',
            overflow: 'hidden',
            minHeight: '44px',
            maxHeight: '200px'
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
        />
        <button 
          type="submit" 
          disabled={!message.trim() || disabled || isSubmitting}
          className="chat-send-button"
        >
          {isSubmitting ? (
            <div className="spinner"></div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="m22 2-7 20-4-9-9-4z"/>
              <path d="M22 2 11 13"/>
            </svg>
          )}
        </button>
      </div>
    </form>
  );
};
