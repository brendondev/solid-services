'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { chatApi } from '@/services/chat';
import { Conversation } from '@/types/chat';
import { MessageBubble } from './message-bubble';
import { toast } from 'sonner';

interface PortalChatWidgetProps {
  customerId: string;
  customerName: string;
}

export function PortalChatWidget({ customerId, customerName }: PortalChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debug log
  console.log('[PortalChatWidget] Component mounted/updated:', {
    customerId,
    customerName,
    isOpen,
    hasConversation: !!conversation
  });

  // Carregar ou criar conversa
  useEffect(() => {
    if (isOpen && !conversation) {
      loadConversation();
    }
  }, [isOpen]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages, isOpen]);

  // Polling para novas mensagens (a cada 3 segundos)
  useEffect(() => {
    if (!isOpen || !conversation) return;

    const interval = setInterval(() => {
      loadConversation(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, conversation?.id]);

  const loadConversation = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      // Buscar conversas do cliente
      const conversations = await chatApi.getConversationsByCustomer(customerId);

      if (conversations.length > 0) {
        // Pegar a primeira conversa aberta
        const openConv = conversations.find(c => c.status === 'open') || conversations[0];
        const fullConv = await chatApi.getConversationById(openConv.id);
        setConversation(fullConv);

        // Marcar como lida se aberta
        if (isOpen) {
          await chatApi.markAsRead(fullConv.id);
          setUnreadCount(0);
        }
      } else {
        // Criar nova conversa
        const newConv = await chatApi.createConversation({
          customerId,
          title: `Conversa com ${customerName}`,
        });
        setConversation(newConv);
      }
    } catch (error: any) {
      console.error('Erro ao carregar conversa:', error);
      if (!silent) {
        toast.error('Erro ao carregar conversa');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !conversation || sending) return;

    const content = message.trim();
    setMessage('');
    setSending(true);

    try {
      await chatApi.sendMessage({
        conversationId: conversation.id,
        content,
        senderType: 'customer',
      });

      // Recarregar conversa
      await loadConversation(true);
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
      setMessage(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
      setUnreadCount(0);
    } else {
      setIsOpen(false);
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Botão flutuante */}
      {!isOpen && (
        <Button
          onClick={toggleOpen}
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 bg-blue-600 hover:bg-blue-700"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      )}

      {/* Janela de chat */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-6 right-6 w-[400px] max-w-[calc(100vw-3rem)] bg-background border border-border rounded-lg shadow-2xl flex flex-col z-50 transition-all',
            isMinimized ? 'h-14' : 'h-[600px] max-h-[calc(100vh-8rem)]'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">Chat de Suporte</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMinimize}
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleOpen}
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mensagens */}
          {!isMinimized && (
            <>
              <div
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10 scroll-smooth"
              >
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : conversation && conversation.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <MessageCircle className="w-12 h-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium mb-1">Bem-vindo ao chat!</p>
                    <p className="text-xs text-muted-foreground">
                      Envie uma mensagem para iniciar a conversa com nossa equipe
                    </p>
                  </div>
                ) : (
                  <>
                    {conversation?.messages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwnMessage={msg.senderType === 'customer'}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border bg-background">
                <div className="flex items-end gap-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua mensagem..."
                    disabled={sending || loading}
                    className="min-h-[44px] max-h-[120px] resize-none text-base flex-1"
                    rows={1}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sending || loading}
                    size="icon"
                    className="shrink-0 min-h-[44px] min-w-[44px]"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Pressione Enter para enviar, Shift+Enter para nova linha
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
