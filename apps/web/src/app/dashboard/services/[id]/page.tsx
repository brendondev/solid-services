'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { servicesApi } from '@/lib/api/services';
import { Loader2 } from 'lucide-react';
import { showToast } from '@/lib/toast';

const serviceSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),

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

        defaultPrice: Number(service.defaultPrice),
        estimatedDuration: service.estimatedDuration || undefined,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar serviço';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (data: ServiceFormData) => {
    setIsLoading(true);
    setError('');

    try {
      // O model Service não tem categoria — campo removido do formulário
      const payload = {
        name: data.name,
        description: data.description || undefined,
        defaultPrice: data.defaultPrice,
        estimatedDuration: data.estimatedDuration || undefined,
      };

      await servicesApi.update(id, payload);
      showToast.success('Serviço atualizado com sucesso');
      router.push('/dashboard/services');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar serviço';
      setError(errorMessage);
      showToast.error(errorMessage);
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
          className="text-muted-foreground hover:text-foreground"
        >
          ← Voltar
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Serviço</h1>
          <p className="text-muted-foreground">Atualize as informações do serviço</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive-subtle border border-destructive/30 text-destructive px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-card p-6 rounded-lg ">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Informações do Serviço
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Nome do Serviço *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-info"
                placeholder="Ex: Instalação Elétrica"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Descrição
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-info"
                placeholder="Descreva o serviço..."
                disabled={isLoading}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>


            <div>
              <label
                htmlFor="defaultPrice"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Preço Padrão (R$) *
              </label>
              <input
                {...register('defaultPrice')}
                type="number"
                step="0.01"
                min="0"
                id="defaultPrice"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-info"
                placeholder="0.00"
                disabled={isLoading}
              />
              {errors.defaultPrice && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.defaultPrice.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="estimatedDuration"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Duração Estimada (minutos)
              </label>
              <input
                {...register('estimatedDuration')}
                type="number"
                min="0"
                id="estimatedDuration"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-info"
                placeholder="Ex: 120"
                disabled={isLoading}
              />
              {errors.estimatedDuration && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.estimatedDuration.message}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Tempo estimado para conclusão do serviço
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/services')}
            className="px-4 py-2 border border-input text-foreground rounded-lg hover:bg-background"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-info text-primary-foreground rounded-lg hover:bg-info disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : 'Atualizar Serviço'}
          </button>
        </div>
      </form>
    </div>
  );
}
