'use client';

import { useEffect, useRef, useState } from 'react';
import { Conversation, ChatMessage as ChatMessageType } from '@/types/chat';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, Archive, XCircle, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface ChatWindowProps {
  conversation: Conversation | null;
  currentUserId: string;
  onSendMessage: (content: string) => Promise<void>;
  onClose?: () => void; // Para mobile
  onArchive?: () => void;
  onCloseConversation?: () => void;
  onReopenConversation?: () => void;
  loading?: boolean;
}

export function ChatWindow({
  conversation,
  currentUserId,
  onSendMessage,
  onClose,
  onArchive,
  onCloseConversation,
  onReopenConversation,
  loading = false,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll para última mensagem
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages, autoScroll]);

  // Detectar se usuário scrollou manualmente
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isAtBottom);
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhuma conversa selecionada</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Selecione uma conversa na lista ou inicie uma nova para começar a trocar mensagens
          </p>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (conversation.status) {
      case 'open':
        return <Badge variant="default">Aberta</Badge>;
      case 'closed':
        return <Badge variant="secondary">Fechada</Badge>;
      case 'archived':
        return <Badge variant="outline">Arquivada</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-muted/30">
        {/* Botão voltar (mobile) */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden shrink-0 min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}

        {/* Info do cliente */}
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-base truncate">
            {conversation.customer?.name || conversation.title || 'Sem título'}
          </h2>
          {conversation.customer?.email && (
            <p className="text-xs text-muted-foreground truncate">
              {conversation.customer.email}
            </p>
          )}
        </div>

        {/* Status e ações */}
        <div className="flex items-center gap-2">
          {getStatusBadge()}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 min-h-[44px] min-w-[44px]"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {conversation.status === 'open' && onCloseConversation && (
                <DropdownMenuItem onClick={onCloseConversation}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Fechar conversa
                </DropdownMenuItem>
              )}
              {conversation.status === 'closed' && onReopenConversation && (
                <DropdownMenuItem onClick={onReopenConversation}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reabrir conversa
                </DropdownMenuItem>
              )}
              {onArchive && (
                <DropdownMenuItem onClick={onArchive}>
                  <Archive className="w-4 h-4 mr-2" />
                  Arquivar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mensagens */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : conversation.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">
              Nenhuma mensagem ainda. Envie a primeira mensagem!
            </p>
          </div>
        ) : (
          <>
            {conversation.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.senderType === 'employee'}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSend={onSendMessage}
        disabled={conversation.status !== 'open' || loading}
        placeholder={
          conversation.status !== 'open'
            ? 'Esta conversa está fechada'
            : 'Digite sua mensagem...'
        }
      />
    </div>
  );
}
