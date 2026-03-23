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
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Auto-gerar slug a partir do nome da empresa
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setValue('tenantSlug', slug);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Solid Service</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Crie sua conta e comece a gerenciar seus serviços
          </p>
        </div>

        {/* Card do formulário */}
        <div className="bg-white py-6 px-4 sm:py-8 sm:px-6 shadow-sm sm:shadow rounded-lg">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
            Criar Conta
          </h2>

          {/* Alert de erro */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm sm:text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Nome da Empresa */}
            <div>
              <label
                htmlFor="tenantName"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
              >
                Nome da Empresa *
              </label>
              <input
                {...register('tenantName')}
                type="text"
                id="tenantName"
                autoComplete="organization"
                className={`w-full px-4 py-3 text-base sm:text-sm border rounded-lg shadow-sm
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                  ${errors.tenantName
                    ? 'border-red-300 bg-red-50 focus:ring-red-500'
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
                placeholder="Minha Empresa Ltda"
                disabled={isLoading}
                onChange={handleNameChange}
              />
              {errors.tenantName && (
                <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.tenantName.message}
                </p>
              )}
            </div>

            {/* Slug da Empresa */}
            <div>
              <label
                htmlFor="tenantSlug"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
              >
                Identificador da Empresa *
              </label>
              <input
                {...register('tenantSlug')}
                type="text"
                id="tenantSlug"
                className={`w-full px-4 py-3 text-base sm:text-sm border rounded-lg shadow-sm
                  transition-colors duration-200 bg-gray-50
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
                  ${errors.tenantSlug
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
                placeholder="minha-empresa"
                disabled={isLoading}
              />
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                Será usado na URL do seu sistema (apenas letras, números e hífens)
              </p>
              {errors.tenantSlug && (
                <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.tenantSlug.message}
                </p>
              )}
            </div>

            {/* Nome do Administrador */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
              >
                Seu Nome *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                autoComplete="name"
                className={`w-full px-4 py-3 text-base sm:text-sm border rounded-lg shadow-sm
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                  ${errors.name
                    ? 'border-red-300 bg-red-50 focus:ring-red-500'
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
                placeholder="João Silva"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
              >
                Email *
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                autoComplete="email"
                className={`w-full px-4 py-3 text-base sm:text-sm border rounded-lg shadow-sm
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                  ${errors.email
                    ? 'border-red-300 bg-red-50 focus:ring-red-500'
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
                placeholder="joao@minhaempresa.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
              >
                Senha *
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                autoComplete="new-password"
                className={`w-full px-4 py-3 text-base sm:text-sm border rounded-lg shadow-sm
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                  ${errors.password
                    ? 'border-red-300 bg-red-50 focus:ring-red-500'
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
                placeholder="••••••••"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Cloudflare Turnstile */}
            {!!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
              <div className="flex justify-center py-2">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                  onVerify={(token) => setTurnstileToken(token)}
                  onError={() => setError('Erro ao verificar CAPTCHA. Tente novamente.')}
                  onExpire={() => setTurnstileToken('')}
                />
              </div>
            )}

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={isLoading || (!!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken)}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 px-4
                border border-transparent rounded-lg shadow-sm
                text-base sm:text-sm font-medium text-white
                bg-primary hover:bg-primary/90 active:bg-primary/80
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary
                transition-all duration-200"
            >
              {isLoading && (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? 'Criando conta...' : 'Criar Conta Gratuitamente'}
            </button>
          </form>

          {/* Link para login */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm sm:text-base text-gray-600">
            <p>
              Já tem uma conta?{' '}
              <a
                href="/auth/login"
                className="text-primary hover:text-primary/80 font-medium underline-offset-2 hover:underline
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                Faça login
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs sm:text-sm text-gray-500">
          <p>Ao criar uma conta, você concorda com nossos Termos de Uso</p>
        </div>
      </div>
    </div>
  );
}
