'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatAPI, type Conversation, type ChatMessage } from '@/lib/api/chat';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ChatWidgetProps {
  customerId?: string;
  className?: string;
}

export function ChatWidget({ customerId, className }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Carrega ou cria conversa
  useEffect(() => {
    if (isOpen && customerId && !conversation) {
      loadOrCreateConversation();
    }
  }, [isOpen, customerId]);

  // SSE - Real-time updates
  useEffect(() => {
    if (!conversation?.id) return;

    let eventSource: EventSource | null = null;

    try {
      eventSource = chatAPI.createEventSource(conversation.id);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'message' && data.data) {
            const newMsg = data.data as ChatMessage;

            // Adiciona apenas se for nova mensagem
            setMessages((prev) => {
              const exists = prev.find((m) => m.id === newMsg.id);
              if (exists) return prev;
              return [...prev, newMsg];
            });

            // Marca como lida se janela está aberta
            if (isOpen && !isMinimized) {
              chatAPI.markAsRead(conversation.id);
            } else {
              setUnreadCount((prev) => prev + 1);
            }

            scrollToBottom();
          }
        } catch (error) {
          console.error('Erro ao processar mensagem SSE:', error);
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch (error) {
      console.error('Erro ao conectar SSE:', error);
    }

    return () => {
      eventSource?.close();
    };
  }, [conversation?.id, isOpen, isMinimized]);

  // Carrega contador de não lidas
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await chatAPI.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Erro ao carregar contador:', error);
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadOrCreateConversation = async () => {
    if (!customerId) return;

    try {
      setIsLoading(true);

      // Tenta buscar conversa existente
      const conversations = await chatAPI.getConversationsByCustomer(customerId);
      let conv = conversations.find((c) => c.status === 'open');

      // Cria nova se não existir
      if (!conv) {
        conv = await chatAPI.createConversation(customerId, 'Chat de Suporte');
      }

      // Busca mensagens
      const full = await chatAPI.getConversation(conv.id);
      setConversation(full);
      setMessages(full.messages || []);

      // Marca como lida
      await chatAPI.markAsRead(conv.id);
      setUnreadCount(0);

      scrollToBottom();
    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
      toast.error('Erro ao carregar conversa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation) return;

    const content = newMessage.trim();
    setNewMessage('');

    try {
      const message = await chatAPI.sendMessage(
        conversation.id,
        content,
        'employee' // Assumindo que é funcionário no dashboard
      );

      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
      setNewMessage(content);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className={cn('fixed bottom-4 right-4 z-50', className)}>
      {/* Chat window */}
      {isOpen && (
        <div
          className={cn(
            'mb-4 w-96 rounded-lg border border-border bg-background shadow-xl transition-all',
            isMinimized ? 'h-14' : 'h-[600px]'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Chat de Suporte</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleMinimize}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleOpen}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <ScrollArea className="h-[calc(100%-8rem)] p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">Carregando...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
                    <p className="text-xs text-muted-foreground">
                      Envie uma mensagem para iniciar a conversa
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex',
                          message.senderType === 'employee' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[80%] rounded-lg px-3 py-2',
                            message.senderType === 'employee'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p
                            className={cn(
                              'text-xs mt-1',
                              message.senderType === 'employee'
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            )}
                          >
                            {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!conversation}
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !conversation}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating button */}
      {!isOpen && (
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={toggleOpen}
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      )}
    </div>
  );
}
