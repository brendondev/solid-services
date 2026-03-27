'use client';

import { Bell, Menu, Search, Settings } from 'lucide-react';
import { ThemeToggleDropdown } from '@/components/theme';
import { useState } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

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

        {/* Search */}
        <div className="flex-1 flex items-center gap-2 max-w-2xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar... (⌘K)"
              className="w-full h-9 pl-9 pr-4 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              onFocus={() => setSearchOpen(true)}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors">
            <Bell className="w-5 h-5" />
            {/* Badge */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </button>

          {/* Theme Toggle */}
          <ThemeToggleDropdown />

          {/* Settings */}
          <button className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);

  // TODO: Get user from auth context
  const user = {
    name: 'Usuário',
    email: 'usuario@example.com',
    avatar: null,
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-accent transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
          {getInitials(user.name)}
        </div>
        <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
          {user.name}
        </span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-popover shadow-lg z-50 overflow-hidden">
            {/* User info */}
            <div className="p-3 border-b border-border">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <a
                href="/dashboard/profile"
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                Meu Perfil
              </a>
              <a
                href="/dashboard/planos"
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                Planos e Assinatura
              </a>
              <a
                href="/dashboard/users"
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                Usuários
              </a>
            </div>

            {/* Logout */}
            <div className="border-t border-border py-1">
              <button
                onClick={() => {
                  // TODO: Implement logout
                  window.location.href = '/auth/login';
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
