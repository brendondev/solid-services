'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Package, History } from 'lucide-react';

interface PortalLayoutProps {
  children: ReactNode;
  customerName?: string;
  token: string;
}

export default function PortalLayout({
  children,
  customerName,
  token,
}: PortalLayoutProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Início',
      href: `/portal/${token}`,
      icon: Home,
      current: pathname === `/portal/${token}`,
    },
    {
      name: 'Orçamentos',
      href: `/portal/${token}/quotations`,
      icon: FileText,
      current: pathname?.startsWith(`/portal/${token}/quotations`),
    },
    {
      name: 'Ordens de Serviço',
      href: `/portal/${token}/orders`,
      icon: Package,
      current: pathname?.startsWith(`/portal/${token}/orders`),
    },
    {
      name: 'Histórico',
      href: `/portal/${token}/history`,
      icon: History,
      current: pathname === `/portal/${token}/history`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Portal do Cliente
              </h1>
              {customerName && (
                <p className="text-sm text-gray-600 mt-1">
                  Bem-vindo, {customerName}
                </p>
              )}
            </div>
            <div className="text-sm text-gray-500">
              <a
                href="mailto:suporte@solid-service.com"
                className="hover:text-gray-700"
              >
                Precisa de ajuda?
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2026 Solid Service. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
