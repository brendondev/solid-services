'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ordersApi, ServiceOrder } from '@/lib/api/orders';
import { customersApi, Customer } from '@/lib/api/customers';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { showToast } from '@/lib/toast';

const editOrderSchema = z.object({
  customerId: z.string().min(1, 'Selecione um cliente'),
  scheduledFor: z.string().optional(),
  notes: z.string().optional(),
});

type EditOrderFormData = z.infer<typeof editOrderSchema>;

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditOrderFormData>({
    resolver: zodResolver(editOrderSchema),
  });

  useEffect(() => {
    loadData();
  }, [orderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [orderData, customersData] = await Promise.all([
        ordersApi.findOne(orderId),
        customersApi.findActive(),
      ]);

      // Verificar se pode editar
      if (orderData.status === 'completed' || orderData.status === 'cancelled') {
        setError('Não é possível editar uma ordem concluída ou cancelada');
        setOrder(orderData);
        setLoading(false);
        return;
      }

      setOrder(orderData);
      setCustomers(Array.isArray(customersData) ? customersData : []);

      // Preencher formulário com dados existentes
      reset({
        customerId: orderData.customerId,
        scheduledFor: orderData.scheduledFor
          ? new Date(orderData.scheduledFor).toISOString().slice(0, 16)
          : '',
        notes: orderData.notes || '',
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar ordem';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EditOrderFormData) => {
    if (!order) return;

    try {
      setSubmitting(true);
      setError('');

      await ordersApi.update(orderId, {
        customerId: data.customerId,
        scheduledFor: data.scheduledFor || undefined,
        notes: data.notes || undefined,
      });

      showToast.success('Ordem de serviço atualizada com sucesso');
      router.push(`/dashboard/orders/${orderId}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar ordem';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          Ordem não encontrada
        </div>
        <button
          onClick={() => router.push('/dashboard/orders')}
          className="text-primary hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para ordens
        </button>
      </div>
    );
  }

  // Se ordem não pode ser editada
  if (order.status === 'completed' || order.status === 'cancelled') {
    return (
      <div className="space-y-4 animate-fadeInUp">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/dashboard/orders/${orderId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Ordem {order.number}</h1>
            <p className="text-muted-foreground mt-1">Atualizar informações da ordem</p>
          </div>
        </div>

        <div className="bg-warning/10 border border-warning/20 text-warning px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Ordem não pode ser editada</p>
            <p className="text-sm mt-1">
              Ordens concluídas ou canceladas não podem ser modificadas por questões de auditoria.
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push(`/dashboard/orders/${orderId}`)}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Voltar para Detalhes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(`/dashboard/orders/${orderId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Editar Ordem {order.number}</h1>
          <p className="text-muted-foreground mt-1">Atualizar informações da ordem</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Aviso sobre limitações */}
      <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-3 rounded-lg flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium">Limitações de Edição</p>
          <p className="mt-1">
            Por questões de auditoria, os <strong>serviços e valores</strong> da ordem não podem ser editados.
            Se precisar alterar esses dados, cancele esta ordem e crie uma nova.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Informações Editáveis */}
        <div className="bg-card p-6 rounded-lg shadow border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Informações da Ordem</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                {...register('customerId')}
                id="customerId"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card"
                disabled={submitting}
              >
                <option value="">Selecione um cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="mt-1 text-sm text-destructive">{errors.customerId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="scheduledFor" className="block text-sm font-medium text-gray-700 mb-2">
                Agendamento
              </label>
              <input
                {...register('scheduledFor')}
                type="datetime-local"
                id="scheduledFor"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={submitting}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Data e hora prevista para execução
              </p>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                {...register('notes')}
                id="notes"
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Informações adicionais sobre a ordem..."
                disabled={submitting}
              />
            </div>
          </div>
        </div>

        {/* Serviços (Somente Leitura) */}
        <div className="bg-gray-50 p-6 rounded-lg border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Serviços (Somente Leitura)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Descrição
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Qtd
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Preço Unit.
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-foreground">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-foreground text-right">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground text-right">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground text-right">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Nenhum serviço
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t flex justify-end">
            <div className="text-right">
              <span className="text-sm text-gray-600">Valor Total: </span>
              <span className="text-2xl font-bold text-foreground">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/orders/${orderId}`)}
            className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-gray-50 transition-colors font-medium"
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
