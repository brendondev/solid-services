'use client';

import { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, CheckCheck, Paperclip } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const formattedTime = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div
      className={cn(
        'flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isOwnMessage ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm',
          isOwnMessage
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm'
        )}
      >
        {/* Nome do remetente (apenas se não for própria mensagem) */}
        {!isOwnMessage && message.senderName && (
          <div className="text-xs font-semibold mb-1 opacity-70">
            {message.senderName}
          </div>
        )}

        {/* Conteúdo da mensagem */}
        <div className="text-sm sm:text-base break-words whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Anexos (se houver) */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className={cn(
                  'flex items-center gap-2 text-xs px-2 py-1.5 rounded',
                  isOwnMessage
                    ? 'bg-primary-foreground/10'
                    : 'bg-background/50'
                )}
              >
                <Paperclip className="w-3 h-3" />
                <span className="truncate flex-1">{attachment.fileName}</span>
                <span className="text-xs opacity-70">
                  {(attachment.fileSize / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Timestamp e status de leitura */}
        <div
          className={cn(
            'flex items-center gap-1 mt-1 text-xs opacity-70',
            isOwnMessage ? 'justify-end' : 'justify-start'
          )}
        >
          <span>{formattedTime}</span>
          {isOwnMessage && (
            <span className="ml-1">
              {message.read ? (
                <CheckCheck className="w-3.5 h-3.5" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
