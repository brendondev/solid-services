'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  main: 'Principal',
  customers: 'Clientes',
  orders: 'Ordens de Serviço',
  quotations: 'Orçamentos',
  schedule: 'Agenda',
  financial: 'Financeiro',
  services: 'Serviços',
  suppliers: 'Fornecedores',
  planos: 'Planos',
  users: 'Usuários',
  new: 'Novo',
  edit: 'Editar',
  receivables: 'Recebíveis',
  payables: 'Pagáveis',
};

export function Breadcrumbs() {
  const pathname = usePathname();

  const paths = pathname.split('/').filter(Boolean);

  // Don't show breadcrumbs on main dashboard
  if (paths.length <= 2) {
    return null;
  }

  const breadcrumbs = paths.map((path, index) => {
    const href = '/' + paths.slice(0, index + 1).join('/');
    const name = routeNames[path] || path;

    return {
      name,
      href,
      isLast: index === paths.length - 1,
    };
  });

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
      <Link
        href="/dashboard/main"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>

      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.name}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-foreground transition-colors"
            >
              {crumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
