'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { customersApi, Customer } from '@/lib/api/customers';
import { showToast } from '@/lib/toast';

const customerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  document: z.string().optional(),
  type: z.enum(['individual', 'company']),
  status: z.enum(['active', 'inactive']),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    if (id) {
      loadCustomer();
    }
  }, [id]);

  const loadCustomer = async () => {
    try {
      setLoadingCustomer(true);
      const data = await customersApi.findOne(id);
      setCustomer(data);

      // Preencher o formulário com os dados do cliente
      reset({
        name: data.name,
        document: data.document || '',
        type: data.type as 'individual' | 'company',
        status: data.status as 'active' | 'inactive',
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar cliente';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoadingCustomer(false);
    }
  };

  const onSubmit = async (data: CustomerFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const cleanData: any = {
        name: data.name,
        type: data.type,
        status: data.status,
        document: data.document || undefined,
      };

      await customersApi.update(id, cleanData);
      showToast.success('Cliente atualizado com sucesso');
      router.push(`/dashboard/customers/${id}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar cliente';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingCustomer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando cliente...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Cliente não encontrado
        </div>
        <button
          onClick={() => router.push('/dashboard/customers')}
          className="text-blue-600 hover:text-blue-700"
        >
          ← Voltar para clientes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push(`/dashboard/customers/${id}`)}
          className="text-muted-foreground hover:text-foreground"
        >
          ← Voltar
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Cliente</h1>
          <p className="text-muted-foreground">{customer.name}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Informações Básicas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                Nome / Razão Social *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                Tipo *
              </label>
              <select
                {...register('type')}
                id="type"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="individual">Pessoa Física</option>
                <option value="company">Empresa</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                Status *
              </label>
              <select
                {...register('status')}
                id="status"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="document"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                CPF / CNPJ
              </label>
              <input
                {...register('document')}
                type="text"
                id="document"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                disabled={isLoading}
              />
              {errors.document && (
                <p className="mt-1 text-sm text-red-600">{errors.document.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/customers/${id}`)}
            className="px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-muted"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
