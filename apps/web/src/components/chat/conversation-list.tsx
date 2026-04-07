'use client';

import { Conversation } from '@/types/chat';
import { ConversationItem } from './conversation-item';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Loader2, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
  loading?: boolean;
  onStatusFilter?: (status: string) => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  loading = false,
  onStatusFilter,
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar conversas por busca
  const filteredConversations = conversations.filter((conv) => {
    const customerName = conv.customer?.name?.toLowerCase() || '';
    const title = conv.title?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();

    return customerName.includes(search) || title.includes(search);
  });

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Conversas
          </h2>
          <Button
            onClick={onNewConversation}
            size="icon"
            className="shrink-0 min-h-[44px] min-w-[44px]"
            title="Nova conversa"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Busca */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-base"
          />
        </div>

        {/* Filtro de status */}
        {onStatusFilter && (
          <Select onValueChange={onStatusFilter} defaultValue="all">
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="open">Abertas</SelectItem>
              <SelectItem value="closed">Fechadas</SelectItem>
              <SelectItem value="archived">Arquivadas</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Lista de conversas */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm
                ? 'Tente buscar por outro termo'
                : 'Clique no botão + para iniciar uma nova conversa'}
            </p>
            {!searchTerm && (
              <Button onClick={onNewConversation} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nova Conversa
              </Button>
            )}
          </div>
        ) : (
          <div>
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                onClick={() => onSelectConversation(conversation)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
