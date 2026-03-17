'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { servicesApi } from '@/lib/api/services';
import { Loader2 } from 'lucide-react';

const serviceSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  category: z.string().optional(),
  defaultPrice: z.coerce.number().min(0, 'Preço deve ser maior ou igual a 0'),
  estimatedDuration: z.coerce.number().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  });

  useEffect(() => {
    loadService();
  }, [id]);

  const loadService = async () => {
    try {
      setIsFetching(true);
      setError('');
      const service = await servicesApi.findOne(id);

      reset({
        name: service.name,
        description: service.description || '',
        category: service.category || '',
        defaultPrice: Number(service.defaultPrice),
        estimatedDuration: service.estimatedDuration || undefined,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar serviço');
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (data: ServiceFormData) => {
    setIsLoading(true);
    setError('');

    try {
      // Backend não aceita campo 'category', então remover
      const payload = {
        name: data.name,
        description: data.description || undefined,
        defaultPrice: data.defaultPrice,
        estimatedDuration: data.estimatedDuration || undefined,
      };

      await servicesApi.update(id, payload);
      router.push('/dashboard/services');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar serviço');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push('/dashboard/services')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Voltar
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Serviço</h1>
          <p className="text-gray-600">Atualize as informações do serviço</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informações do Serviço
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome do Serviço *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Instalação Elétrica"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descrição
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva o serviço..."
                disabled={isLoading}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Categoria
              </label>
              <input
                {...register('category')}
                type="text"
                id="category"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Elétrica, Hidráulica..."
                disabled={isLoading}
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="defaultPrice"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Preço Padrão (R$) *
              </label>
              <input
                {...register('defaultPrice')}
                type="number"
                step="0.01"
                min="0"
                id="defaultPrice"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                disabled={isLoading}
              />
              {errors.defaultPrice && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.defaultPrice.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="estimatedDuration"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Duração Estimada (minutos)
              </label>
              <input
                {...register('estimatedDuration')}
                type="number"
                min="0"
                id="estimatedDuration"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 120"
                disabled={isLoading}
              />
              {errors.estimatedDuration && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.estimatedDuration.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Tempo estimado para conclusão do serviço
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/services')}
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
            {isLoading ? 'Salvando...' : 'Atualizar Serviço'}
          </button>
        </div>
      </form>
    </div>
  );
}
