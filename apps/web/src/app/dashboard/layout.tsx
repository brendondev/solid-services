'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth';
import { Toaster } from 'react-hot-toast';
import { CommandPaletteProvider, CommandPaletteTrigger } from '@/components/command-palette';
import {
  LayoutDashboard,
  Users,
  Wrench,
  FileText,
  ClipboardList,
  Calendar,
  DollarSign,
  Building2,
  Receipt,
  Menu,
  X,
  LogOut,
  Loader2,
  Crown
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard/main', icon: LayoutDashboard },
  { name: 'Clientes', href: '/dashboard/customers', icon: Users },
  { name: 'Serviços', href: '/dashboard/services', icon: Wrench },
  { name: 'Orçamentos', href: '/dashboard/quotations', icon: FileText },
  { name: 'Ordens de Serviço', href: '/dashboard/orders', icon: ClipboardList },
  { name: 'Agenda', href: '/dashboard/schedule', icon: Calendar },
  { name: 'Financeiro', href: '/dashboard/financial', icon: DollarSign },
  { name: 'Fornecedores', href: '/dashboard/suppliers', icon: Building2 },
  { name: 'Contas a Pagar', href: '/dashboard/payables', icon: Receipt },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const storedUser = authApi.getStoredUser();
    const token = authApi.getStoredToken();

    if (!storedUser || !token) {
      router.push('/auth/login');
      return;
    }

    setUser(storedUser);
  }, [router]);

  const handleLogout = () => {
    authApi.logout();
    router.push('/auth/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <CommandPaletteProvider>
      <Toaster />
      <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border shadow-sm transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Solid Service
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </a>
              );
            })}

            {/* Separator */}
            <div className="my-3 border-t border-border"></div>

            {/* Planos link */}
            <a
              href="/dashboard/planos"
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                pathname === '/dashboard/planos'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50'
              }`}
            >
              <Crown className="w-5 h-5 flex-shrink-0" />
              <span>Planos</span>
            </a>
          </nav>

          {/* User info */}
          <div className="border-t border-border px-3 py-4">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold shadow-sm">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:pl-64' : ''
        }`}
      >
        {/* Top bar */}
        <header className="bg-white border-b border-border shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-4 px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1 max-w-2xl">
              <CommandPaletteTrigger />
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">
                Tenant: <span className="font-medium text-gray-900">{user.tenantSlug}</span>
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      </div>
    </CommandPaletteProvider>
  );
}
