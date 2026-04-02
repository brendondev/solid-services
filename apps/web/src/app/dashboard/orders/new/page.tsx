'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Wrench } from 'lucide-react';
import { ordersApi } from '@/lib/api/orders';
import { customersApi, Customer } from '@/lib/api/customers';
import { servicesApi, Service } from '@/lib/api/services';
import { usersApi, User } from '@/lib/api/users';
import { showToast } from '@/lib/toast';
import { CreateCustomerModal } from '@/components/modals/CreateCustomerModal';
import { CreateServiceModal } from '@/components/modals/CreateServiceModal';

const orderItemSchema = z.object({
  serviceId: z.string().min(1, 'Selecione um serviço'),
  description: z.string().min(1, 'Descrição obrigatória'),
  quantity: z.coerce.number().min(1, 'Quantidade mínima é 1'),
  unitPrice: z.coerce.number().min(0, 'Preço deve ser maior ou igual a 0'),
});

const orderSchema = z.object({
  customerId: z.string().min(1, 'Selecione um cliente'),
  assignedTo: z.string().optional(),
  scheduledFor: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'Adicione pelo menos um item'),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function NewOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quotationId = searchParams?.get('quotationId');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      items: [
        {
          serviceId: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [customersData, servicesData, usersData] = await Promise.all([
        customersApi.findActive(),
        servicesApi.findActive(),
        usersApi.findAll(),
      ]);
      setCustomers(Array.isArray(customersData) ? customersData : []);
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar dados iniciais';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoadingData(false);
    }
  };

  const handleServiceChange = (index: number, serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      setValue(`items.${index}.description`, service.name);
      setValue(`items.${index}.unitPrice`, service.defaultPrice);
    }
  };

  const handleCustomerCreated = async (customerId: string) => {
    try {
      const customersData = await customersApi.findActive();
      setCustomers(Array.isArray(customersData) ? customersData : []);

      // Aguardar um tick para garantir que o DOM foi atualizado
      await new Promise(resolve => setTimeout(resolve, 100));

      setValue('customerId', customerId, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });

      console.log('✅ Cliente selecionado:', customerId);
      showToast.success('Cliente criado e selecionado!');
    } catch (err) {
      console.error('Erro ao recarregar clientes:', err);
    }
  };

  const handleServiceCreated = async (serviceId: string) => {
    try {
      const servicesData = await servicesApi.findActive();
      setServices(Array.isArray(servicesData) ? servicesData : []);

      // Aguardar um tick para garantir que o DOM foi atualizado
      await new Promise(resolve => setTimeout(resolve, 100));

      // Se houver apenas 1 item, seleciona automaticamente
      if (fields.length === 1) {
        setValue('items.0.serviceId', serviceId, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        });
        handleServiceChange(0, serviceId);
      }

      console.log('✅ Serviço selecionado:', serviceId);
      showToast.success('Serviço criado e selecionado!');
    } catch (err) {
      console.error('Erro ao recarregar serviços:', err);
    }
  };

  const calculateItemTotal = (index: number) => {
    const item = watchItems?.[index];
    if (!item) return 0;
    return (item.quantity || 0) * (item.unitPrice || 0);
  };

  const calculateGrandTotal = () => {
    if (!watchItems) return 0;
    return watchItems.reduce((total, item) => {
      return total + (item.quantity || 0) * (item.unitPrice || 0);
    }, 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const onSubmit = async (data: OrderFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const order = await ordersApi.create({
        customerId: data.customerId,
        assignedTo: data.assignedTo || undefined,
        quotationId: quotationId || undefined,
        scheduledFor: data.scheduledFor || undefined,
        notes: data.notes || undefined,
        items: data.items.map((item, index) => ({
          serviceId: item.serviceId,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          order: index + 1,
        })),
      });

      showToast.success('Ordem de serviço criada com sucesso');
      router.push(`/dashboard/orders/${order.id}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar ordem de serviço';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push('/dashboard/orders')}
          className="text-gray-600 hover:text-foreground"
        >
          ← Voltar
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Ordem de Serviço</h1>
          <p className="text-gray-600">Crie uma ordem de serviço manualmente</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações da Ordem */}
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Informações da Ordem
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="customerId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cliente *
              </label>
              <div className="flex gap-2">
                <select
                  {...register('customerId')}
                  id="customerId"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value="">Selecione um cliente</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap"
                  disabled={isLoading}
                  title="Novo Cliente"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Novo</span>
                </button>
              </div>
              {errors.customerId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.customerId.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="scheduledFor"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Agendamento
              </label>
              <input
                {...register('scheduledFor')}
                type="datetime-local"
                id="scheduledFor"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Data e hora prevista para execução
              </p>
            </div>

            <div>
              <label
                htmlFor="assignedTo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Técnico Responsável
              </label>
              <select
                {...register('assignedTo')}
                id="assignedTo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="">Selecione um técnico (opcional)</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Usuário que executará o serviço
              </p>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Observações
              </label>
              <textarea
                {...register('notes')}
                id="notes"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Informações adicionais sobre a ordem..."
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Itens da Ordem */}
        <div className="bg-card p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Serviços a Executar
            </h2>
            <button
              type="button"
              onClick={() =>
                append({
                  serviceId: '',
                  description: '',
                  quantity: 1,
                  unitPrice: 0,
                })
              }
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={isLoading}
            >
              + Adicionar Serviço
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border border-gray-200 rounded-lg space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Serviço {index + 1}</h3>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                      disabled={isLoading}
                    >
                      Remover
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Serviço *
                    </label>
                    <div className="flex gap-2">
                      <select
                        {...register(`items.${index}.serviceId`)}
                        onChange={(e) => handleServiceChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                      >
                        <option value="">Selecione um serviço</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - {formatCurrency(service.defaultPrice)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsServiceModalOpen(true)}
                        className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium whitespace-nowrap"
                        disabled={isLoading}
                        title="Novo Serviço"
                      >
                        <Wrench className="w-4 h-4" />
                        <span className="hidden sm:inline">Novo</span>
                      </button>
                    </div>
                    {errors.items?.[index]?.serviceId && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.items[index]?.serviceId?.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição *
                    </label>
                    <input
                      {...register(`items.${index}.description`)}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descrição do serviço"
                      disabled={isLoading}
                    />
                    {errors.items?.[index]?.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.items[index]?.description?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantidade *
                    </label>
                    <input
                      {...register(`items.${index}.quantity`)}
                      type="number"
                      min="1"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.items[index]?.quantity?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço Unitário (R$) *
                    </label>
                    <input
                      {...register(`items.${index}.unitPrice`)}
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    {errors.items?.[index]?.unitPrice && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.items[index]?.unitPrice?.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm text-gray-600">Total: </span>
                  <span className="text-lg font-bold text-foreground">
                    {formatCurrency(calculateItemTotal(index))}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {errors.items && (
            <p className="mt-2 text-sm text-red-600">
              {typeof errors.items.message === 'string'
                ? errors.items.message
                : 'Verifique os serviços da ordem'}
            </p>
          )}
        </div>

        {/* Total Geral */}
        <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-foreground">
              Valor Total da Ordem
            </span>
            <span className="text-3xl font-bold text-purple-600">
              {formatCurrency(calculateGrandTotal())}
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/orders')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Criando...' : 'Criar Ordem de Serviço'}
          </button>
        </div>
      </form>

      {/* Modais de criação rápida */}
      <CreateCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={handleCustomerCreated}
      />

      <CreateServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSuccess={handleServiceCreated}
      />
    </div>
  );
}
