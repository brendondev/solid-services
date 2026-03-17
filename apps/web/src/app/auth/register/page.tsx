'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api/auth';
import { Turnstile } from '@/components/auth/Turnstile';

const registerSchema = z.object({
  tenantName: z.string().min(3, 'Nome da empresa deve ter no mínimo 3 caracteres'),
  tenantSlug: z
    .string()
    .min(3, 'Slug deve ter no mínimo 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Auto-gerar slug a partir do nome da empresa
  const tenantName = watch('tenantName');
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Atualizar o campo tenantSlug
    const slugInput = document.getElementById('tenantSlug') as HTMLInputElement;
    if (slugInput) slugInput.value = slug;
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.register({
        ...data,
        turnstileToken,
      });

      // Salvar tokens e usuário no localStorage
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Redirecionar para dashboard
      router.push('/dashboard/main');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Erro ao criar conta. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Solid Service</h1>
          <p className="mt-2 text-sm text-gray-600">
            Crie sua conta e comece a gerenciar seus serviços
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Criar Conta
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome da Empresa */}
            <div>
              <label
                htmlFor="tenantName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome da Empresa
              </label>
              <input
                {...register('tenantName')}
                type="text"
                id="tenantName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Minha Empresa Ltda"
                disabled={isLoading}
                onChange={handleNameChange}
              />
              {errors.tenantName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.tenantName.message}
                </p>
              )}
            </div>

            {/* Slug da Empresa */}
            <div>
              <label
                htmlFor="tenantSlug"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Identificador da Empresa (slug)
              </label>
              <input
                {...register('tenantSlug')}
                type="text"
                id="tenantSlug"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                placeholder="minha-empresa"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Será usado na URL do seu sistema
              </p>
              {errors.tenantSlug && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.tenantSlug.message}
                </p>
              )}
            </div>

            {/* Nome do Administrador */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Seu Nome
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="João Silva"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="joao@minhaempresa.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Senha
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Cloudflare Turnstile */}
            {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
              <div className="flex justify-center">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                  onVerify={(token) => setTurnstileToken(token)}
                  onError={() => setError('Erro ao verificar CAPTCHA. Tente novamente.')}
                  onExpire={() => setTurnstileToken('')}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken)}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Já tem uma conta?{' '}
              <a href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Faça login
              </a>
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>Ao criar uma conta, você concorda com nossos Termos de Uso</p>
        </div>
      </div>
    </div>
  );
}
