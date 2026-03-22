import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  onType?: (isTyping: boolean) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled, onType }) => {
  const [inputValue, setInputValue] = useState('');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSend = () => {
    if (!inputValue.trim() || disabled) return;
    onSend(inputValue.trim());
    setInputValue('');
    if (onType) onType(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    if (onType) {
      onType(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => onType(false), 2000);
    }
  };

  return (
    <div className="p-5 border-t border-border/50 bg-background/60 backdrop-blur-xl z-20">
      <div className="flex items-center gap-3 bg-secondary/30 border border-border/40 p-1.5 rounded-[1.5rem] shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 group">
        <button className="p-2.5 text-muted-foreground hover:bg-secondary/50 rounded-[1.25rem] transition-all hover:scale-110 active:scale-90 opacity-60">
          <Smile size={20} />
        </button>
        <input
          type="text"
          className="flex-1 bg-transparent border-none py-2 px-1 text-sm focus:outline-none placeholder:text-muted-foreground/50 font-medium text-foreground"
          placeholder="Type your message..."
          value={inputValue}
          onChange={handleChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={disabled}
        />
        <button className="p-2.5 text-muted-foreground hover:bg-secondary/50 rounded-[1.25rem] transition-all hover:scale-110 active:scale-90 rotate-45 opacity-60">
          <Paperclip size={20} />
        </button>
        <button 
          onClick={handleSend}
          disabled={!inputValue.trim() || disabled}
          className={cn(
            "p-3 rounded-[1.25rem] transition-all transform-gpu shadow-lg active:scale-90",
            inputValue.trim() && !disabled
              ? "bg-primary text-primary-foreground shadow-primary/20 scale-105" 
              : "bg-muted text-muted-foreground opacity-40 cursor-not-allowed"
          )}
        >
          <Send size={18} className="translate-x-0.5 -translate-y-0.5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
