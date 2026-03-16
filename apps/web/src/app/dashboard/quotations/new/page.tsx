'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { quotationsApi } from '@/lib/api/quotations';
import { customersApi, Customer } from '@/lib/api/customers';
import { servicesApi, Service } from '@/lib/api/services';

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
      const [customersData, servicesData] = await Promise.all([
        customersApi.findActive(),
        servicesApi.findActive(),
      ]);
      setCustomers(Array.isArray(customersData) ? customersData : []);
      setServices(Array.isArray(servicesData) ? servicesData : []);
    } catch (err: any) {
      setError('Erro ao carregar dados iniciais');
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

  const onSubmit = async (data: QuotationFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const quotation = await quotationsApi.create({
        customerId: data.customerId,
        validUntil: data.validUntil || undefined,
        notes: data.notes || undefined,
        items: data.items.map((item, index) => ({
          serviceId: item.serviceId,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          order: index + 1, // Backend exige campo order >= 1
        })),
      });

      router.push(`/dashboard/quotations/${quotation.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar orçamento');
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
          onClick={() => router.push('/dashboard/quotations')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Voltar
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Orçamento</h1>
          <p className="text-gray-600">Crie um orçamento para um cliente</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações do Orçamento */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informações do Orçamento
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="customerId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cliente *
              </label>
              <select
                {...register('customerId')}
                id="customerId"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="">Selecione um cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.customerId.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="validUntil"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Válido até
              </label>
              <input
                {...register('validUntil')}
                type="date"
                id="validUntil"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
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
                placeholder="Informações adicionais sobre o orçamento..."
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Itens do Orçamento */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
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
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={isLoading}
            >
              + Adicionar Item
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border border-gray-200 rounded-lg space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Item {index + 1}</h3>
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
                    <select
                      {...register(`items.${index}.serviceId`)}
                      onChange={(e) =>
                        handleServiceChange(index, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    >
                      <option value="">Selecione um serviço</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} - {formatCurrency(service.defaultPrice)}
                        </option>
                      ))}
                    </select>
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
                  <span className="text-sm text-gray-600">Total do item: </span>
                  <span className="text-lg font-bold text-gray-900">
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
                : 'Verifique os itens do orçamento'}
            </p>
          )}
        </div>

        {/* Total Geral */}
        <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">
              Valor Total do Orçamento
            </span>
            <span className="text-3xl font-bold text-blue-600">
              {formatCurrency(calculateGrandTotal())}
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/quotations')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Criando...' : 'Criar Orçamento'}
          </button>
        </div>
      </form>
    </div>
  );
}
