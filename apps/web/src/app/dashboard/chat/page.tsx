'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Search, Archive } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatAPI, type Conversation, type ChatMessage } from '@/lib/api/chat';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Carrega conversas
  useEffect(() => {
    loadConversations();
  }, []);

  // Carrega mensagens quando seleciona conversa
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await chatAPI.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast.error('Erro ao carregar conversas');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const conversation = await chatAPI.getConversation(conversationId);
      setMessages(conversation.messages || []);

      // Marca como lida
      await chatAPI.markAsRead(conversationId);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const content = newMessage.trim();
    setNewMessage('');

    try {
      const message = await chatAPI.sendMessage(
        selectedConversation.id,
        content,
        'employee'
      );

      setMessages((prev) => [...prev, message]);
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

  const handleArchiveConversation = async (conversationId: string) => {
    try {
      await chatAPI.updateConversation(conversationId, { status: 'archived' });
      await loadConversations();
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
      toast.success('Conversa arquivada');
    } catch (error) {
      console.error('Erro ao arquivar conversa:', error);
      toast.error('Erro ao arquivar conversa');
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Chat</h1>
        <p className="text-muted-foreground">
          Gerencie conversas com clientes
        </p>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 border border-border rounded-lg overflow-hidden">
        {/* Lista de conversas */}
        <div className="col-span-4 border-r border-border bg-muted/30">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="h-[calc(100%-5rem)]">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Carregando...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma conversa encontrada
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredConversations.map((conversation) => {
                  const lastMessage = conversation.messages?.[0];
                  const isSelected = selectedConversation?.id === conversation.id;

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={cn(
                        'w-full p-3 rounded-lg text-left transition-colors hover:bg-accent',
                        isSelected && 'bg-accent'
                      )}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium truncate">
                          {conversation.customer.name}
                        </p>
                        {conversation._count && conversation._count.messages > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                            {conversation._count.messages}
                          </span>
                        )}
                      </div>
                      {lastMessage && (
                        <>
                          <p className="text-sm text-muted-foreground truncate">
                            {lastMessage.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(lastMessage.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Área de mensagens */}
        <div className="col-span-8 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    {selectedConversation.customer.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.title || 'Chat de Suporte'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleArchiveConversation(selectedConversation.id)}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Arquivar
                </Button>
              </div>

              {/* Mensagens */}
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma mensagem ainda
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex',
                          message.senderType === 'employee'
                            ? 'justify-end'
                            : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] rounded-lg px-4 py-2',
                            message.senderType === 'employee'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <p
                            className={cn(
                              'text-xs mt-1',
                              message.senderType === 'employee'
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            )}
                          >
                            {new Date(message.createdAt).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    Enviar
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <MessageCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium mb-1">Selecione uma conversa</p>
              <p className="text-sm text-muted-foreground">
                Escolha uma conversa na lista para ver as mensagens
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
