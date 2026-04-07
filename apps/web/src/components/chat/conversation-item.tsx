'use client';

import { Conversation } from '@/types/chat';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Circle } from 'lucide-react';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const hasUnread = (conversation.unreadCount ?? 0) > 0;

  const formattedTime = conversation.lastMessageAt
    ? formatDistanceToNow(new Date(conversation.lastMessageAt), {
        addSuffix: false,
        locale: ptBR,
      })
    : null;

  const getStatusColor = () => {
    switch (conversation.status) {
      case 'open':
        return 'text-green-500';
      case 'closed':
        return 'text-gray-400';
      case 'archived':
        return 'text-orange-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-4 py-3 text-left transition-all border-b border-border hover:bg-muted/50',
        'min-h-[72px] active:scale-[0.98] active:bg-muted',
        isActive && 'bg-muted border-l-4 border-l-primary'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar / Status indicator */}
        <div className="relative shrink-0 mt-1">
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold',
              'bg-primary/10 text-primary'
            )}
          >
            {conversation.customer?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          {conversation.status === 'open' && (
            <Circle
              className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3', getStatusColor())}
              fill="currentColor"
            />
          )}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            {/* Nome do cliente */}
            <h3
              className={cn(
                'font-semibold text-sm truncate',
                hasUnread && 'text-primary'
              )}
            >
              {conversation.customer?.name || conversation.title || 'Sem título'}
            </h3>

            {/* Timestamp */}
            {formattedTime && (
              <span className="text-xs text-muted-foreground shrink-0">
                {formattedTime}
              </span>
            )}
          </div>

          {/* Preview da última mensagem */}
          {lastMessage && (
            <p
              className={cn(
                'text-sm text-muted-foreground truncate',
                hasUnread && 'font-medium text-foreground'
              )}
            >
              {lastMessage.senderType === 'employee' && 'Você: '}
              {lastMessage.content}
            </p>
          )}

          {/* Badge de não lidas */}
          {hasUnread && (
            <Badge
              variant="default"
              className="mt-1.5 min-w-[20px] h-5 px-1.5 text-xs font-bold"
            >
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
