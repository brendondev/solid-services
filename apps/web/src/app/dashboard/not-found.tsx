'use client';

import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Página 404 personalizada para o dashboard
 */
export default function DashboardNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Ilustração */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
            <FileQuestion className="w-12 h-12 text-primary" />
          </div>
          <div className="text-6xl font-bold text-gray-200 mb-2">404</div>
        </div>

        {/* Mensagem */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Página não encontrada
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 text-gray-700 bg-muted rounded-lg hover:bg-muted/80 active:bg-muted/90 transition-colors font-medium min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <button
            onClick={() => router.push('/dashboard/main')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-colors font-medium min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            Ir para Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
