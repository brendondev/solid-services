'use client';

import { Menu, Settings, User, LogOut, Users as UsersIcon, Crown, Building2, Bell, Zap, Shield, Database, FileText } from 'lucide-react';
import { ThemeToggleDropdown } from '@/components/theme';
import { NotificationsDropdown } from '@/components/notifications';
import { CommandPaletteTrigger } from '@/components/command-palette';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search - Command Palette */}
        <div className="flex-1 flex items-center gap-2 max-w-2xl">
          <CommandPaletteTrigger />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <NotificationsDropdown />

          {/* Theme Toggle */}
          <ThemeToggleDropdown />

          {/* Settings */}
          <SettingsDropdown />

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

function SettingsDropdown() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors"
        title="Configurações"
      >
        <Settings className="w-5 h-5" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 rounded-lg border border-border bg-popover shadow-lg z-50 overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2 border-b border-border bg-muted/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Configurações
              </p>
            </div>

            {/* Empresa */}
            <div className="py-1">
              <button
                onClick={() => {
                  setOpen(false);
                  router.push('/dashboard/settings/company');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Building2 className="w-4 h-4 text-blue-600" />
                <div className="flex-1 text-left">
                  <p className="font-medium">Empresa</p>
                  <p className="text-xs text-muted-foreground">Dados, logo, endereço</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  router.push('/dashboard/users');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <UsersIcon className="w-4 h-4 text-green-600" />
                <div className="flex-1 text-left">
                  <p className="font-medium">Usuários</p>
                  <p className="text-xs text-muted-foreground">Gerenciar equipe</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  router.push('/dashboard/settings/notifications');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Bell className="w-4 h-4 text-amber-600" />
                <div className="flex-1 text-left">
                  <p className="font-medium">Notificações</p>
                  <p className="text-xs text-muted-foreground">Alertas e emails</p>
                </div>
              </button>
            </div>

            <div className="border-t border-border"></div>

            {/* Sistema */}
            <div className="py-1">
              <button
                onClick={() => {
                  setOpen(false);
                  router.push('/dashboard/settings/integrations');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Zap className="w-4 h-4 text-purple-600" />
                <div className="flex-1 text-left">
                  <p className="font-medium">Integrações</p>
                  <p className="text-xs text-muted-foreground">APIs, WhatsApp, NFe</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  router.push('/dashboard/settings/security');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Shield className="w-4 h-4 text-red-600" />
                <div className="flex-1 text-left">
                  <p className="font-medium">Segurança</p>
                  <p className="text-xs text-muted-foreground">2FA, logs, auditoria</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  router.push('/dashboard/settings/backup');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Database className="w-4 h-4 text-cyan-600" />
                <div className="flex-1 text-left">
                  <p className="font-medium">Backup e Dados</p>
                  <p className="text-xs text-muted-foreground">Exportar, importar</p>
                </div>
              </button>
            </div>

            <div className="border-t border-border"></div>

            {/* Footer */}
            <div className="py-1">
              <button
                onClick={() => {
                  setOpen(false);
                  router.push('/dashboard/planos');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Crown className="w-4 h-4 text-amber-500" />
                <div className="flex-1 text-left">
                  <p className="font-medium">Plano Atual</p>
                  <p className="text-xs text-muted-foreground">Upgrade, downgrade</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = authApi.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    authApi.logout();
    router.push('/auth/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-accent transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
          {getInitials(user.name)}
        </div>
        <div className="hidden md:flex flex-col items-start max-w-[150px]">
          <span className="text-sm font-medium truncate w-full">{user.name}</span>
          <span className="text-xs text-muted-foreground truncate w-full">{user.email}</span>
        </div>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 rounded-lg border border-border bg-popover shadow-lg z-50 overflow-hidden">
            {/* User info */}
            <div className="p-4 border-b border-border bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {getInitials(user.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <button
                onClick={() => {
                  setOpen(false);
                  router.push('/dashboard/profile');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <User className="w-4 h-4" />
                Meu Perfil
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push('/dashboard/planos');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Crown className="w-4 h-4" />
                Planos e Assinatura
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push('/dashboard/users');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <UsersIcon className="w-4 h-4" />
                Gerenciar Usuários
              </button>
            </div>

            {/* Logout */}
            <div className="border-t border-border py-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
