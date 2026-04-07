'use client';

import { useState, KeyboardEvent, useRef } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  onFileAttach?: (file: File) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ChatInput({
  onSend,
  onFileAttach,
  placeholder = 'Digite sua mensagem...',
  disabled = false,
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      await onSend(message.trim());
      setMessage('');

      // Reset altura do textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter envia, Shift+Enter adiciona nova linha
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize do textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div
      className={cn(
        'flex items-end gap-2 p-4 bg-background border-t border-border',
        className
      )}
    >
      {/* Botão de anexo (opcional) */}
      {onFileAttach && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 min-h-[44px] min-w-[44px]"
          disabled={disabled || sending}
          title="Anexar arquivo"
        >
          <Paperclip className="w-5 h-5" />
        </Button>
      )}

      {/* Input de mensagem */}
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || sending}
        className="min-h-[44px] max-h-[120px] resize-none text-base"
        rows={1}
      />

      {/* Botão de enviar */}
      <Button
        onClick={handleSend}
        disabled={!message.trim() || disabled || sending}
        size="icon"
        className="shrink-0 min-h-[44px] min-w-[44px]"
        title="Enviar mensagem (Enter)"
      >
        {sending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
}
