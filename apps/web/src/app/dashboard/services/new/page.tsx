'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { servicesApi } from '@/lib/api/services';
import { showToast } from '@/lib/toast';

const serviceSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),

  defaultPrice: z.coerce.number().min(0, 'Preço deve ser maior ou igual a 0'),
  estimatedDuration: z.coerce.number().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function NewServicePage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  });

  const onSubmit = async (data: ServiceFormData) => {
    setIsLoading(true);
    setError('');

    try {
      // O model Service não tem categoria — o campo foi removido do formulário
      const payload = {
        name: data.name,
        description: data.description || undefined,
        defaultPrice: data.defaultPrice,
        estimatedDuration: data.estimatedDuration || undefined,
      };

      const service = await servicesApi.create(payload);
      showToast.success('Serviço criado com sucesso');
      router.push('/dashboard/services');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar serviço';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-foreground">Novo Serviço</h1>
          <p className="text-muted-foreground">Adicione um serviço ao catálogo</p>
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
            {isLoading ? 'Salvando...' : 'Salvar Serviço'}
          </button>
        </div>
      </form>
    </div>
  );
}
