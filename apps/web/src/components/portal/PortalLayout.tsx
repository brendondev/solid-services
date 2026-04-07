'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Package, History, HelpCircle } from 'lucide-react';
import { PortalChatWidget } from '@/components/chat';

interface PortalLayoutProps {
  children: ReactNode;
  customerName?: string;
  customerId?: string;
  token: string;
}

export default function PortalLayout({
  children,
  customerName,
  customerId,
  token,
}: PortalLayoutProps) {
  const pathname = usePathname();

  console.log('[PortalLayout] Renderizando com:', { customerName, customerId, hasChat: !!customerId });

  const navigation = [
    {
      name: 'Início',
      shortName: 'Início',
      href: `/portal/${token}`,
      icon: Home,
      current: pathname === `/portal/${token}`,
    },
    {
      name: 'Orçamentos',
      shortName: 'Orçamentos',
      href: `/portal/${token}/quotations`,
      icon: FileText,
      current: pathname?.startsWith(`/portal/${token}/quotations`),
    },
    {
      name: 'Ordens de Serviço',
      shortName: 'Ordens',
      href: `/portal/${token}/orders`,
      icon: Package,
      current: pathname?.startsWith(`/portal/${token}/orders`),
    },
    {
      name: 'Histórico',
      shortName: 'Histórico',
      href: `/portal/${token}/history`,
      icon: History,
      current: pathname === `/portal/${token}/history`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-0">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                Portal do Cliente
              </h1>
              {customerName && (
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 truncate">
                  Olá, {customerName}
                </p>
              )}
            </div>
            <a
              href="mailto:suporte@solid-service.com"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-700 active:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Ajuda"
            >
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </a>
          </div>
        </div>
      </header>

      {/* Desktop Navigation */}
      <nav className="hidden sm:block bg-white border-b border-gray-200 sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors
                    ${
                      item.current
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
        <div className="grid grid-cols-4 gap-0">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center min-h-[64px] py-2 px-1 transition-colors
                  ${
                    item.current
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 active:bg-gray-100'
                  }
                `}
              >
                <Icon className={`w-6 h-6 ${item.current ? 'stroke-[2.5]' : ''}`} />
                <span className={`text-xs mt-1 font-medium ${item.current ? 'font-semibold' : ''}`}>
                  {item.shortName}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer (Desktop only) */}
      <footer className="hidden sm:block bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2026 Solid Service. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Chat Widget */}
      {customerId && customerName && (
        <PortalChatWidget
          customerId={customerId}
          customerName={customerName}
        />
      )}
    </div>
  );
}
