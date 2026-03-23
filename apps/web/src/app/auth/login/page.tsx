'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api/auth';
import { Turnstile } from '@/components/auth/Turnstile';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.login({
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
        'Erro ao fazer login. Verifique suas credenciais.'
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
            Sistema de Gestão para Prestadores de Serviços
          </p>
        </div>

        {/* Card do formulário */}
        <div className="bg-white py-6 px-4 sm:py-8 sm:px-6 shadow-sm sm:shadow rounded-lg">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
            Fazer Login
          </h2>

          {/* Alert de erro */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm sm:text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
            {/* Campo Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
              >
                Email
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
                placeholder="seu@email.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
              >
                Senha
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                autoComplete="current-password"
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
              <div className="flex justify-center">
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
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Link para registro */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm sm:text-base text-gray-600">
            <p>
              Ainda não tem conta?{' '}
              <a
                href="/auth/register"
                className="text-primary hover:text-primary/80 font-medium underline-offset-2 hover:underline
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                Registre-se gratuitamente
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs sm:text-sm text-gray-500">
          <p>Desenvolvido com Next.js + NestJS</p>
        </div>
      </div>
    </div>
  );
}
