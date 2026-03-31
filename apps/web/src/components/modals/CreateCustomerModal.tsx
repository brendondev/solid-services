'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { customersApi } from '@/lib/api/customers';
import { showToast } from '@/lib/toast';

const customerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  type: z.enum(['individual', 'company'], {
    errorMap: () => ({ message: 'Tipo de cliente é obrigatório' }),
  }),
  document: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customerId: string) => void;
}

export function CreateCustomerModal({ isOpen, onClose, onSuccess }: CreateCustomerModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDuplicateEmail, setConfirmDuplicateEmail] = useState(false);
  const [pendingData, setPendingData] = useState<CustomerFormData | null>(null);
  const [existingCustomer, setExistingCustomer] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      type: 'individual',
    },
  });

  // Reseta o form com valores padrão quando o modal abre
  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        type: 'individual',
        document: '',
        email: '',
        phone: '',
      });
    }
  }, [isOpen, reset]);

  const handleCreateCustomer = async (data: CustomerFormData, forceDuplicateEmail = false) => {
    setIsLoading(true);

    try {
      const payload = {
        name: data.name,
        type: data.type,
        document: data.document || undefined,
        contacts: data.email || data.phone ? [{
          name: data.name,
          email: data.email || undefined,
          phone: data.phone || undefined,
          isPrimary: true,
        }] : undefined,
      };

      console.log('Enviando payload:', payload);

      const customer = await customersApi.create(payload);

      showToast.success('Cliente criado com sucesso!');
      reset();
      setConfirmDuplicateEmail(false);
      setPendingData(null);
      onSuccess(customer.id);
      onClose();
    } catch (err: any) {
      console.error('❌ ERRO COMPLETO:', err);
      console.error('📦 ERRO RESPONSE:', err.response);
      console.error('📋 ERRO DATA:', err.response?.data);

      // Tenta capturar a mensagem de erro de diferentes estruturas
      const errorData = err.response?.data;
      let errorMessage = 'Erro ao criar cliente';

      // Tenta pegar a mensagem de diferentes formas
      if (errorData) {
        // Se a mensagem for um array
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(', ');
        }
        // Se a mensagem for uma string
        else if (typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        }
        // Se tiver error como string
        else if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        }
        // Se tiver details
        else if (errorData.details) {
          errorMessage = errorData.details;
        }
      }

      // Se ainda for internal server error, tenta pegar do err.message
      if (errorMessage.toLowerCase().includes('internal server error')) {
        errorMessage = err.message || errorMessage;
      }

      console.log('💬 MENSAGEM FINAL:', errorMessage);

      // Verifica se é erro de duplicação
      const errorLower = errorMessage.toLowerCase();
      const isDuplicateDocument = errorLower.includes('cpf') ||
                                   errorLower.includes('cnpj') ||
                                   errorLower.includes('documento') ||
                                   errorLower.includes('document') ||
                                   errorLower.includes('já cadastrado') ||
                                   errorLower.includes('duplicate');

      const isDuplicateEmail = errorLower.includes('email') ||
                               errorLower.includes('e-mail');

      // Se for CPF/CNPJ duplicado, mostra erro direto
      if (isDuplicateDocument && !isDuplicateEmail) {
        showToast.error('❌ CPF/CNPJ já cadastrado! Verifique se o cliente já existe.');
        return;
      }

      // Se for email duplicado e não confirmou ainda, pede confirmação
      if (isDuplicateEmail && !forceDuplicateEmail) {
        setPendingData(data);

        // Tenta pegar dados do cliente existente do erro
        const existingCustomerData = errorData?.existingCustomer;
        if (existingCustomerData) {
          setExistingCustomer(existingCustomerData);
        }

        setConfirmDuplicateEmail(true);
        showToast.error('⚠️ Email já cadastrado. Deseja criar mesmo assim?');
        return;
      }

      // Outros erros - mostra detalhes completos
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CustomerFormData) => {
    await handleCreateCustomer(data, false);
  };

  const handleConfirmDuplicate = async () => {
    if (pendingData) {
      await handleCreateCustomer(pendingData, true);
    }
  };

  const handleCancelDuplicate = () => {
    setConfirmDuplicateEmail(false);
    setPendingData(null);
    setExistingCustomer(null);
    setIsLoading(false);
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
          <h2 className="text-xl font-semibold text-foreground">Novo Cliente</h2>
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

          {/* Tipo */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1">
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

          {/* CPF/CNPJ */}
          <div>
            <label htmlFor="document" className="block text-sm font-medium text-foreground mb-1">
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
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
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

          {/* Telefone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
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
              {isLoading ? 'Criando...' : 'Criar Cliente'}
            </button>
          </div>
        </form>

        {/* Confirmação de email duplicado */}
        {confirmDuplicateEmail && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 rounded-lg">
            <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                ⚠️ Email já cadastrado
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Este email já está sendo usado por outro cliente:
              </p>

              {existingCustomer && (
                <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4">
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Cliente existente:</span>
                      <p className="font-semibold text-foreground">{existingCustomer.name}</p>
                    </div>
                    {existingCustomer.document && (
                      <div>
                        <span className="text-xs text-muted-foreground">CPF/CNPJ:</span>
                        <p className="text-sm text-foreground">{existingCustomer.document}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-xs text-muted-foreground">Tipo:</span>
                      <p className="text-sm text-foreground">
                        {existingCustomer.type === 'individual' ? 'Pessoa Física' : 'Empresa'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground mb-4">
                Deseja criar um novo cliente com o mesmo email mesmo assim?
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancelDuplicate}
                  className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDuplicate}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Criar Mesmo Assim
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
