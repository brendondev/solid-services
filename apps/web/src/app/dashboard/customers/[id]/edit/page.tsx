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
  // Contato primário
  contactName: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  // Endereço primário
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
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

      // Buscar contato e endereço primários
      const primaryContact = data.contacts?.find(c => c.isPrimary) || data.contacts?.[0];
      const primaryAddress = data.addresses?.find(a => a.isPrimary) || data.addresses?.[0];

      // Preencher o formulário com os dados do cliente
      reset({
        name: data.name,
        document: data.document || '',
        type: data.type as 'individual' | 'company',
        status: data.status as 'active' | 'inactive',
        // Contato
        contactName: primaryContact?.name || '',
        email: primaryContact?.email || '',
        phone: primaryContact?.phone || '',
        // Endereço
        street: primaryAddress?.street || '',
        number: primaryAddress?.number || '',
        complement: primaryAddress?.complement || '',
        district: primaryAddress?.neighborhood || '',
        city: primaryAddress?.city || '',
        state: primaryAddress?.state || '',
        zipCode: primaryAddress?.zipCode || '',
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
      // Atualizar dados básicos
      await customersApi.update(id, {
        name: data.name,
        type: data.type,
        status: data.status,
        document: data.document || undefined,
      });

      // TODO: Implementar API para atualizar contatos e endereços
      // Por enquanto, apenas atualiza os dados básicos

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
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded">
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
    <div className="space-y-6 max-w-4xl">
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
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-card p-6 rounded-lg shadow border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Informações Básicas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Nome / Razão Social *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Tipo *
              </label>
              <select
                {...register('type')}
                id="type"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              >
                <option value="individual">Pessoa Física</option>
                <option value="company">Empresa</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Status *
              </label>
              <select
                {...register('status')}
                id="status"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="document"
                className="block text-sm font-medium text-foreground mb-1"
              >
                CPF / CNPJ
              </label>
              <input
                {...register('document')}
                type="text"
                id="document"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                disabled={isLoading}
              />
              {errors.document && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.document.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="bg-card p-6 rounded-lg shadow border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Contato Principal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                htmlFor="contactName"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Nome do Contato
              </label>
              <input
                {...register('contactName')}
                type="text"
                id="contactName"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Nome da pessoa de contato"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="email@exemplo.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Telefone
              </label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="(00) 00000-0000"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-card p-6 rounded-lg shadow border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Endereço Principal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label
                htmlFor="street"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Rua / Avenida
              </label>
              <input
                {...register('street')}
                type="text"
                id="street"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Nome da rua"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="number"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Número
              </label>
              <input
                {...register('number')}
                type="text"
                id="number"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="123"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="complement"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Complemento
              </label>
              <input
                {...register('complement')}
                type="text"
                id="complement"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Apto, sala, etc"
                disabled={isLoading}
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="district"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Bairro
              </label>
              <input
                {...register('district')}
                type="text"
                id="district"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Nome do bairro"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Cidade
              </label>
              <input
                {...register('city')}
                type="text"
                id="city"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Nome da cidade"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Estado
              </label>
              <input
                {...register('state')}
                type="text"
                id="state"
                maxLength={2}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring uppercase"
                placeholder="UF"
                disabled={isLoading}
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="zipCode"
                className="block text-sm font-medium text-foreground mb-1"
              >
                CEP
              </label>
              <input
                {...register('zipCode')}
                type="text"
                id="zipCode"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="00000-000"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            ⚠️ Aviso: Atualmente apenas dados básicos são salvos. Atualização de contatos e endereços em breve.
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/customers/${id}`)}
              className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted"
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
        </div>
      </form>
    </div>
  );
}
