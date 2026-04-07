'use client';

import { useState, useEffect, useCallback } from 'react';
import { Conversation } from '@/types/chat';
import { chatApi } from '@/services/chat';
import { ConversationList, ChatWindow } from '@/components/chat';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { customersApi } from '@/lib/api/customers';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentUserId, setCurrentUserId] = useState('');

  // Obter ID do usuário atual (do token)
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id || payload.sub);
      }
    } catch (error) {
      console.error('Erro ao obter ID do usuário:', error);
    }
  }, []);

  // Carregar conversas
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const filters = statusFilter !== 'all' ? { status: statusFilter as any } : undefined;
      const data = await chatApi.getConversations(filters);
      setConversations(data);
    } catch (error: any) {
      console.error('Erro ao carregar conversas:', error);
      toast.error('Erro ao carregar conversas');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Carregar conversa específica com mensagens
  const loadConversation = async (conversationId: string, silent = false) => {
    try {
      if (!silent) setLoadingConversation(true);
      const data = await chatApi.getConversationById(conversationId);
      setActiveConversation(data);

      // Marcar como lida
      await chatApi.markAsRead(conversationId);

      // Atualizar lista (silenciosamente)
      if (!silent) loadConversations();
    } catch (error: any) {
      console.error('Erro ao carregar conversa:', error);
      if (!silent) toast.error('Erro ao carregar conversa');
    } finally {
      if (!silent) setLoadingConversation(false);
    }
  };

  // Polling para atualizar conversa ativa (a cada 3 segundos)
  useEffect(() => {
    if (!activeConversation) return;

    const interval = setInterval(() => {
      loadConversation(activeConversation.id, true);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeConversation?.id]);

  // Selecionar conversa
  const handleSelectConversation = (conversation: Conversation) => {
    loadConversation(conversation.id);
  };

  // Enviar mensagem
  const handleSendMessage = async (content: string) => {
    if (!activeConversation) return;

    try {
      await chatApi.sendMessage({
        conversationId: activeConversation.id,
        content,
        senderType: 'employee',
      });

      // Recarregar conversa para mostrar nova mensagem
      await loadConversation(activeConversation.id);
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
      throw error;
    }
  };

  // Nova conversa - carregar clientes
  const handleNewConversation = async () => {
    try {
      const customersData = await customersApi.findAll();
      setCustomers(customersData);
      setShowNewConversationDialog(true);
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    }
  };

  // Criar nova conversa
  const handleCreateConversation = async () => {
    if (!selectedCustomerId) {
      toast.error('Selecione um cliente');
      return;
    }

    try {
      setCreatingConversation(true);
      const conversation = await chatApi.createConversation({
        customerId: selectedCustomerId,
      });

      toast.success('Conversa criada com sucesso!');
      setShowNewConversationDialog(false);
      setSelectedCustomerId('');

      // Recarregar lista e selecionar nova conversa
      await loadConversations();
      loadConversation(conversation.id);
    } catch (error: any) {
      console.error('Erro ao criar conversa:', error);
      toast.error('Erro ao criar conversa');
    } finally {
      setCreatingConversation(false);
    }
  };

  // Arquivar conversa
  const handleArchive = async () => {
    if (!activeConversation) return;

    try {
      await chatApi.updateConversation(activeConversation.id, { status: 'archived' });
      toast.success('Conversa arquivada');
      setActiveConversation(null);
      loadConversations();
    } catch (error: any) {
      console.error('Erro ao arquivar conversa:', error);
      toast.error('Erro ao arquivar conversa');
    }
  };

  // Fechar conversa
  const handleCloseConversation = async () => {
    if (!activeConversation) return;

    try {
      await chatApi.updateConversation(activeConversation.id, { status: 'closed' });
      toast.success('Conversa fechada');
      loadConversation(activeConversation.id);
      loadConversations();
    } catch (error: any) {
      console.error('Erro ao fechar conversa:', error);
      toast.error('Erro ao fechar conversa');
    }
  };

  // Reabrir conversa
  const handleReopenConversation = async () => {
    if (!activeConversation) return;

    try {
      await chatApi.updateConversation(activeConversation.id, { status: 'open' });
      toast.success('Conversa reaberta');
      loadConversation(activeConversation.id);
      loadConversations();
    } catch (error: any) {
      console.error('Erro ao reabrir conversa:', error);
      toast.error('Erro ao reabrir conversa');
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      {/* Lista de conversas - oculta em mobile quando há conversa ativa */}
      <div className={`w-full lg:w-80 xl:w-96 ${activeConversation ? 'hidden lg:block' : 'block'}`}>
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversation?.id || null}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          loading={loading}
          onStatusFilter={(status) => setStatusFilter(status)}
        />
      </div>

      {/* Área de chat - oculta em mobile quando não há conversa ativa */}
      <div className={`flex-1 ${!activeConversation ? 'hidden lg:flex' : 'flex'}`}>
        <ChatWindow
          conversation={activeConversation}
          currentUserId={currentUserId}
          onSendMessage={handleSendMessage}
          onClose={() => setActiveConversation(null)}
          onArchive={handleArchive}
          onCloseConversation={handleCloseConversation}
          onReopenConversation={handleReopenConversation}
          loading={loadingConversation}
        />
      </div>

      {/* Dialog para nova conversa */}
      <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Conversa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="customer">Cliente</Label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger id="customer" className="mt-1.5">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowNewConversationDialog(false)}
                className="flex-1"
                disabled={creatingConversation}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateConversation}
                className="flex-1"
                disabled={!selectedCustomerId || creatingConversation}
              >
                {creatingConversation && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Conversa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
