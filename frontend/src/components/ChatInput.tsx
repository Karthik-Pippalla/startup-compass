import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Paperclip, Plus, Send, Mic } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onAttach?: (file: File) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatInput = ({ 
  onSend, 
  onAttach, 
  placeholder = "Ask the AI to build something...",
  disabled = false 
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    
    onSend(message);
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAttach) {
      onAttach(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full max-w-4xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="relative">
        <motion.div
          animate={{
            scale: isFocused ? 1.02 : 1,
            boxShadow: isFocused 
              ? '0 20px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 3px rgba(59, 130, 246, 0.1)' 
              : '0 10px 30px -10px rgba(0, 0, 0, 0.15)'
          }}
          transition={{ duration: 0.2 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl"
        >
          <div className="flex items-end gap-3">
            {/* Left side buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                onClick={handleAttach}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white/70 hover:text-white"
              >
                <Paperclip size={18} />
              </motion.button>
              
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white/70 hover:text-white"
              >
                <Plus size={18} />
              </motion.button>
            </div>

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaChange}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                disabled={disabled}
                rows={1}
                className="w-full bg-transparent border-none outline-none resize-none text-white placeholder-white/50 text-lg font-medium leading-relaxed min-h-[28px] max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                style={{ 
                  height: 'auto',
                  lineHeight: '1.5'
                }}
              />
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              {message.trim() ? (
                <motion.button
                  type="submit"
                  disabled={disabled || !message.trim()}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white/70 hover:text-white"
                >
                  <Mic size={18} />
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
      </form>
    </motion.div>
  );
};
