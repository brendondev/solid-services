'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { quotationsApi } from '@/lib/api/quotations';
import { customersApi, Customer } from '@/lib/api/customers';
import { servicesApi, Service } from '@/lib/api/services';
import { showToast } from '@/lib/toast';
import { Loader2, Plus, Trash2, ArrowLeft, UserPlus, Wrench } from 'lucide-react';
import { CreateCustomerModal } from '@/components/modals/CreateCustomerModal';
import { CreateServiceModal } from '@/components/modals/CreateServiceModal';

const quotationItemSchema = z.object({
  serviceId: z.string().min(1, 'Selecione um serviço'),
  description: z.string().min(1, 'Descrição obrigatória'),
  quantity: z.coerce.number().min(1, 'Quantidade mínima é 1'),
  unitPrice: z.coerce.number().min(0, 'Preço deve ser maior ou igual a 0'),
});

const quotationSchema = z.object({
  customerId: z.string().min(1, 'Selecione um cliente'),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
  // discount: feature não implementada no backend ainda
  items: z.array(quotationItemSchema).min(1, 'Adicione pelo menos um item'),
});

type QuotationFormData = z.infer<typeof quotationSchema>;

export default function NewQuotationPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
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
  } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      // discount removido - não implementado
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
  // const watchDiscount = watch('discount'); // removido

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [customersData, servicesData] = await Promise.all([
        customersApi.findActive(),
        servicesApi.findActive(),
      ]);
      setCustomers(Array.isArray(customersData) ? customersData : []);
      setServices(Array.isArray(servicesData) ? servicesData : []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar dados iniciais';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCustomerCreated = async (customerId: string) => {
    // Recarregar lista de clientes
    try {
      const customersData = await customersApi.findActive();
      setCustomers(Array.isArray(customersData) ? customersData : []);
      // Selecionar automaticamente o cliente criado
      setValue('customerId', customerId);
    } catch (err) {
      console.error('Erro ao recarregar clientes:', err);
    }
  };

  const handleServiceCreated = async (serviceId: string) => {
    // Recarregar lista de serviços
    try {
      const servicesData = await servicesApi.findActive();
      setServices(Array.isArray(servicesData) ? servicesData : []);
      // Se houver apenas 1 item, selecionar automaticamente o serviço criado
      if (fields.length === 1) {
        setValue('items.0.serviceId', serviceId);
        handleServiceChange(0, serviceId);
      }
    } catch (err) {
      console.error('Erro ao recarregar serviços:', err);
    }
  };

  const handleServiceChange = (index: number, serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      setValue(`items.${index}.description`, service.name);
      setValue(`items.${index}.unitPrice`, service.defaultPrice);
    }
  };

  const calculateItemTotal = (index: number) => {
    const item = watchItems?.[index];
    if (!item) return 0;
    return (item.quantity || 0) * (item.unitPrice || 0);
  };

  const calculateSubtotal = () => {
    if (!watchItems) return 0;
    return watchItems.reduce((total, item) => {
      return total + (item.quantity || 0) * (item.unitPrice || 0);
    }, 0);
  };

  // calculateDiscountAmount removido - feature não implementada
  // const calculateDiscountAmount = () => {
  //   const subtotal = calculateSubtotal();
  //   const discount = watchDiscount || 0;
  //   return (subtotal * discount) / 100;
  // };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    // const discountAmount = calculateDiscountAmount(); // removido
    return subtotal; // sem desconto por enquanto
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const onSubmit = async (data: QuotationFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const quotation = await quotationsApi.create({
        customerId: data.customerId,
        validUntil: data.validUntil || undefined,
        notes: data.notes || undefined,
        // discount removido - não implementado no backend ainda
        items: data.items.map((item, index) => ({
          serviceId: item.serviceId,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          order: index + 1,
        })),
      });

      showToast.success('Orçamento criado com sucesso');
      router.push(`/dashboard/quotations/${quotation.id}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar orçamento';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-gray-600">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      {/* Header Mobile-First */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <button
          onClick={() => router.push('/dashboard/quotations')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-foreground min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="sm:inline">Voltar</span>
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Novo Orçamento</h1>
          <p className="text-sm sm:text-base text-gray-600">Crie um orçamento para um cliente</p>
        </div>
      </div>

      {/* Alert de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm sm:text-base">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        {/* Informações do Orçamento */}
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">
            Informações do Orçamento
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Cliente */}
            <div className="sm:col-span-2">
              <label
                htmlFor="customerId"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
              >
                Cliente *
              </label>
              <div className="flex gap-2">
                <select
                  {...register('customerId')}
                  id="customerId"
                  className={`flex-1 px-4 py-3 text-base sm:text-sm border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-primary
                    disabled:bg-gray-50 disabled:cursor-not-allowed
                    ${errors.customerId ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
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
                  className="inline-flex items-center justify-center gap-2 px-4 py-3
                    text-sm font-medium text-white bg-green-600 rounded-lg
                    hover:bg-green-700 active:bg-green-800
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  title="Novo Cliente"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Novo</span>
                </button>
              </div>
              {errors.customerId && (
                <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                  <span>⚠</span>
                  {errors.customerId.message}
                </p>
              )}
            </div>

            {/* Data de Validade */}
            <div>
              <label
                htmlFor="validUntil"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
              >
                Válido até
              </label>
              <input
                {...register('validUntil')}
                type="date"
                id="validUntil"
                className="w-full px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary
                  disabled:bg-gray-50"
                disabled={isLoading}
              />
            </div>

            {/* Desconto - Removido: feature não implementada no backend ainda */}
            {/* <div>
              <label
                htmlFor="discount"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
              >
                Desconto (%)
              </label>
              <input
                type="number"
                id="discount"
                min="0"
                max="100"
                step="0.01"
                className="w-full px-4 py-3 text-base sm:text-sm border rounded-lg"
                placeholder="0"
                disabled
              />
            </div> */}

            {/* Observações */}
            <div className="sm:col-span-2">
              <label
                htmlFor="notes"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
              >
                Observações
              </label>
              <textarea
                {...register('notes')}
                id="notes"
                rows={3}
                className="w-full px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary
                  disabled:bg-gray-50"
                placeholder="Informações adicionais sobre o orçamento..."
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Itens do Orçamento */}
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              Itens do Orçamento
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
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2
                text-sm font-medium text-white bg-primary rounded-lg
                hover:bg-primary/90 active:bg-primary/80
                disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4" />
              Adicionar Item
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border border-gray-200 rounded-lg space-y-4"
              >
                {/* Header do item */}
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Item {index + 1}</h3>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="inline-flex items-center gap-1 min-h-[44px] px-3 py-2
                        text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg
                        active:bg-red-100"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                      Remover
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Serviço */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Serviço *
                    </label>
                    <div className="flex gap-2">
                      <select
                        {...register(`items.${index}.serviceId`)}
                        onChange={(e) =>
                          handleServiceChange(index, e.target.value)
                        }
                        className={`flex-1 px-4 py-3 text-base sm:text-sm border rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-primary
                          ${errors.items?.[index]?.serviceId ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
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
                        className="inline-flex items-center justify-center gap-2 px-4 py-3
                          text-sm font-medium text-white bg-purple-600 rounded-lg
                          hover:bg-purple-700 active:bg-purple-800
                          disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                        title="Novo Serviço"
                      >
                        <Wrench className="w-4 h-4" />
                        <span className="hidden sm:inline">Novo</span>
                      </button>
                    </div>
                    {errors.items?.[index]?.serviceId && (
                      <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                        <span>⚠</span>
                        {errors.items[index]?.serviceId?.message}
                      </p>
                    )}
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição *
                    </label>
                    <input
                      {...register(`items.${index}.description`)}
                      type="text"
                      className={`w-full px-4 py-3 text-base sm:text-sm border rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-primary
                        ${errors.items?.[index]?.description ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                      placeholder="Detalhes do serviço"
                      disabled={isLoading}
                    />
                    {errors.items?.[index]?.description && (
                      <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                        <span>⚠</span>
                        {errors.items[index]?.description?.message}
                      </p>
                    )}
                  </div>

                  {/* Quantidade e Preço */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qtd *
                      </label>
                      <input
                        {...register(`items.${index}.quantity`)}
                        type="number"
                        min="1"
                        step="1"
                        className={`w-full px-4 py-3 text-base sm:text-sm border rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-primary
                          ${errors.items?.[index]?.quantity ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                        disabled={isLoading}
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.items[index]?.quantity?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preço (R$) *
                      </label>
                      <input
                        {...register(`items.${index}.unitPrice`)}
                        type="number"
                        min="0"
                        step="0.01"
                        className={`w-full px-4 py-3 text-base sm:text-sm border rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-primary
                          ${errors.items?.[index]?.unitPrice ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                        disabled={isLoading}
                      />
                      {errors.items?.[index]?.unitPrice && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.items[index]?.unitPrice?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Total do item */}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-gray-600">Total do item:</span>
                  <span className="text-lg font-bold text-foreground">
                    {formatCurrency(calculateItemTotal(index))}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {errors.items && (
            <p className="mt-4 text-sm text-red-600">
              {typeof errors.items.message === 'string'
                ? errors.items.message
                : 'Verifique os itens do orçamento'}
            </p>
          )}
        </div>

        {/* Resumo de Valores */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 sm:p-6 rounded-lg border-2 border-primary/20">
          <div className="space-y-3">
            {/* Subtotal */}
            <div className="flex justify-between items-center text-base">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(calculateSubtotal())}
              </span>
            </div>

            {/* Desconto removido - feature não implementada */}

            {/* Total */}
            <div className="flex justify-between items-center pt-3 border-t border-primary/20">
              <span className="text-lg sm:text-xl font-semibold text-foreground">
                Total:
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-primary">
                {formatCurrency(calculateGrandTotal())}
              </span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/quotations')}
            className="min-h-[44px] px-6 py-3 border border-gray-300 text-gray-700 rounded-lg
              hover:bg-gray-50 active:bg-gray-100 text-base font-medium
              disabled:opacity-50"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="min-h-[44px] px-6 py-3 bg-primary text-white rounded-lg
              hover:bg-primary/90 active:bg-primary/80 text-base font-medium
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isLoading ? 'Criando...' : 'Criar Orçamento'}
          </button>
        </div>
      </form>

      {/* Modals */}
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
