'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { quotationsApi, Quotation } from '@/lib/api/quotations';
import {
  Plus,
  FileText,
  DollarSign,
  Eye,
  Trash2,
  Loader2,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadQuotations();
  }, [filter]);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = filter
        ? await quotationsApi.findAll(filter)
        : await quotationsApi.findAll();
      setQuotations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar orçamentos');
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) {
      return;
    }

    try {
      await quotationsApi.remove(id);
      await loadQuotations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir orçamento');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    draft: {
      label: 'Rascunho',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: Clock
    },
    sent: {
      label: 'Enviado',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: FileText
    },
    approved: {
      label: 'Aprovado',
      color: 'bg-success/10 text-success border-success/20',
      icon: CheckCircle
    },
    rejected: {
      label: 'Rejeitado',
      color: 'bg-destructive/10 text-destructive border-destructive/20',
      icon: XCircle
    },
  };

  const getStats = () => {
    const total = quotations.length;
    const totalValue = quotations.reduce((sum, q) => sum + Number(q.totalAmount), 0);
    const approved = quotations.filter(q => q.status === 'approved').length;
    const pending = quotations.filter(q => q.status === 'draft' || q.status === 'sent').length;

    return { total, totalValue, approved, pending };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus orçamentos e propostas</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/quotations/new')}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Novo Orçamento
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Orçamentos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.totalValue)}
              </p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Aprovados</p>
              <p className="text-2xl font-bold text-success mt-1">{stats.approved}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold text-warning mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <Clock className="w-6 h-6 text-warning" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-border">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white min-w-[200px]"
          >
            <option value="">Todos os status</option>
            <option value="draft">Rascunho</option>
            <option value="sent">Enviado</option>
            <option value="approved">Aprovado</option>
            <option value="rejected">Rejeitado</option>
          </select>
        </div>
      </div>

      {/* Quotations List */}
      {quotations.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-border p-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-900 mb-2">Nenhum orçamento encontrado</p>
          <p className="text-muted-foreground mb-6">Comece criando seu primeiro orçamento</p>
          <button
            onClick={() => router.push('/dashboard/quotations/new')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Criar Primeiro Orçamento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {quotations.map((quotation) => {
            const statusInfo = statusConfig[quotation.status];
            const StatusIcon = statusInfo?.icon || FileText;

            return (
              <div
                key={quotation.id}
                className="bg-white rounded-lg shadow border border-border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {quotation.number}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${statusInfo?.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo?.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Cliente</p>
                        <p className="text-base font-medium text-gray-900">
                          {quotation.customer?.name || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Valor Total</p>
                        <p className="text-base font-bold text-success">
                          {formatCurrency(Number(quotation.totalAmount))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Data de Criação</p>
                        <p className="text-base font-medium text-gray-900">
                          {new Date(quotation.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => router.push(`/dashboard/quotations/${quotation.id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalhes
                    </button>
                    <button
                      onClick={() => handleDelete(quotation.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
