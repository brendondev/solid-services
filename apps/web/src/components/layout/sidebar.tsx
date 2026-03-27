'use client';

import {
  LayoutDashboard,
  Users,
  Wrench,
  FileText,
  ClipboardList,
  DollarSign,
  Calendar,
  Building2,
  Truck,
  ChevronLeft,
  Crown,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard/main', icon: LayoutDashboard },
  { name: 'Clientes', href: '/dashboard/customers', icon: Users },
  { name: 'Ordens de Serviço', href: '/dashboard/orders', icon: Wrench },
  { name: 'Orçamentos', href: '/dashboard/quotations', icon: FileText },
  { name: 'Agenda', href: '/dashboard/schedule', icon: Calendar },
  { name: 'Chat', href: '/dashboard/chat', icon: MessageCircle },
  { name: 'Financeiro', href: '/dashboard/financial', icon: DollarSign },
  { name: 'Serviços', href: '/dashboard/services', icon: ClipboardList },
  { name: 'Fornecedores', href: '/dashboard/suppliers', icon: Truck },
  { name: 'Planos', href: '/dashboard/planos', icon: Crown },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full bg-card border-r border-border transition-all duration-300 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${collapsed ? 'w-16' : 'w-64'}`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="font-semibold text-foreground">Solid Service</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Logo - Desktop */}
        <div className="hidden lg:flex h-16 items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="font-semibold text-foreground">Solid Service</span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
            title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  // Close mobile sidebar on navigation
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                {!collapsed && (
                  <span className="text-sm font-medium truncate">{item.name}</span>
                )}
                {!collapsed && isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-border ${collapsed ? 'hidden' : 'block'}`}>
          <div className="p-3 rounded-lg bg-muted">
            <div className="flex items-start gap-2 mb-2">
              <Crown className="w-4 h-4 text-amber-500 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">Plano FREE</p>
                <p className="text-xs text-muted-foreground">2/10 clientes</p>
              </div>
            </div>
            <Link
              href="/dashboard/planos"
              className="block w-full mt-2 px-3 py-1.5 text-xs font-medium text-center bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Fazer Upgrade
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
