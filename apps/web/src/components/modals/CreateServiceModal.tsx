'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { servicesApi } from '@/lib/api/services';
import { showToast } from '@/lib/toast';

const serviceSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  price: z.string().min(1, 'Preço é obrigatório'),
  estimatedDuration: z.coerce.number().optional().or(z.literal('')),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (serviceId: string) => void;
}

export function CreateServiceModal({ isOpen, onClose, onSuccess }: CreateServiceModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  });

  const onSubmit = async (data: ServiceFormData) => {
    setIsLoading(true);

    try {
      const service = await servicesApi.create({
        name: data.name,
        description: data.description || undefined,
        defaultPrice: parseFloat(data.price),
        estimatedDuration: typeof data.estimatedDuration === 'number' ? data.estimatedDuration : undefined,
      });

      showToast.success('Serviço criado com sucesso!');
      reset();
      onSuccess(service.id);
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar serviço';
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Novo Serviço</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Nome do Serviço *
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex: Manutenção Preventiva"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
              Descrição
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={3}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Descreva o serviço..."
              disabled={isLoading}
            />
          </div>

          {/* Preço */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1">
              Preço (R$) *
            </label>
            <input
              {...register('price')}
              type="number"
              step="0.01"
              id="price"
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0,00"
              disabled={isLoading}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price.message}</p>
            )}
          </div>

          {/* Duração estimada */}
          <div>
            <label htmlFor="estimatedDuration" className="block text-sm font-medium text-foreground mb-1">
              Duração Estimada (minutos)
            </label>
            <input
              {...register('estimatedDuration')}
              type="number"
              min="0"
              step="1"
              id="estimatedDuration"
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex: 120 (2 horas)"
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted disabled:opacity-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Criando...' : 'Criar Serviço'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
