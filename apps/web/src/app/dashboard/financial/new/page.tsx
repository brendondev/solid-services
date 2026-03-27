'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { financialApi } from '@/lib/api/financial';
import { customersApi, Customer } from '@/lib/api/customers';
import { ordersApi, ServiceOrder } from '@/lib/api/orders';
import { ArrowLeft, Loader2, DollarSign } from 'lucide-react';

const receivableSchema = z.object({
  customerId: z.string().min(1, 'Cliente é obrigatório'),
  serviceOrderId: z.string().optional(),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  dueDate: z.string().min(1, 'Data de vencimento é obrigatória'),
  description: z.string().optional(),
});

type ReceivableFormData = z.infer<typeof receivableSchema>;

export default function NewReceivablePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ReceivableFormData>({
    resolver: zodResolver(receivableSchema),
  });

  const selectedCustomerId = watch('customerId');

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      loadOrdersByCustomer(selectedCustomerId);
    } else {
      setOrders([]);
    }
  }, [selectedCustomerId]);

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const data = await customersApi.findActive();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError('Erro ao carregar clientes');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadOrdersByCustomer = async (customerId: string) => {
    try {
      setLoadingOrders(true);
      // Buscar todas as ordens e filtrar pelo cliente
      const allOrders = await ordersApi.findAll();
      const customerOrders = allOrders.filter(
        (order: ServiceOrder) => order.customerId === customerId && order.status === 'completed'
      );
      setOrders(customerOrders);
    } catch (err: any) {
      console.error('Erro ao carregar ordens:', err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const onSubmit = async (data: ReceivableFormData) => {
    try {
      setIsSubmitting(true);
      setError('');

      await financialApi.createReceivable({
        customerId: data.customerId,
        serviceOrderId: data.serviceOrderId || undefined,
        amount: data.amount,
        dueDate: data.dueDate,
        description: data.description || undefined,
      });

      router.push('/dashboard/financial');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar recebível');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingCustomers) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push('/dashboard/financial')}
          className="text-gray-600 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Novo Recebível</h1>
          <p className="text-muted-foreground mt-1">
            Registre um novo valor a receber
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="bg-card rounded-lg shadow border border-border p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Cliente */}
          <div>
            <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-1">
              Cliente *
            </label>
            <select
              {...register('customerId')}
              id="customerId"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-card"
              disabled={isSubmitting}
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

          {/* Ordem de Serviço (opcional) */}
          {selectedCustomerId && (
            <div>
              <label htmlFor="serviceOrderId" className="block text-sm font-medium text-gray-700 mb-1">
                Ordem de Serviço (opcional)
              </label>
              <select
                {...register('serviceOrderId')}
                id="serviceOrderId"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-card"
                disabled={isSubmitting || loadingOrders}
              >
                <option value="">Sem ordem de serviço</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.number} - R$ {Number(order.totalAmount).toFixed(2)}
                  </option>
                ))}
              </select>
              {loadingOrders && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Carregando ordens...
                </p>
              )}
            </div>
          )}

          {/* Valor */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Valor (R$) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('amount')}
                type="number"
                step="0.01"
                id="amount"
                className="w-full pl-10 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
                disabled={isSubmitting}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Data de Vencimento */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data de Vencimento *
            </label>
            <input
              {...register('dueDate')}
              type="date"
              id="dueDate"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isSubmitting}
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-destructive">{errors.dueDate.message}</p>
            )}
          </div>

          {/* Descrição/Observações */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição/Observações
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Informações adicionais sobre este recebível..."
              disabled={isSubmitting}
            />
          </div>

          {/* Botões */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/financial')}
              className="px-6 py-2.5 border border-border rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Criar Recebível'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
