'use client';

import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
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
  Plus,
  Search,
  Settings,
  TrendingUp,
} from 'lucide-react';
import { customersApi } from '@/lib/api/customers';

interface RecentItem {
  id: string;
  name: string;
  type: 'customer' | 'order' | 'quotation';
}

// Context para compartilhar estado do Command Palette
const CommandPaletteContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider');
  }
  return context;
};

// Provider que envolve toda a aplicação
export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // Keyboard shortcut to open command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}
      <CommandPaletteDialog />
    </CommandPaletteContext.Provider>
  );
}

function CommandPaletteDialog() {
  const router = useRouter();
  const { open, setOpen } = useCommandPalette();
  const [search, setSearch] = useState('');
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load recent items when opening
  useEffect(() => {
    if (open) {
      loadRecentItems();
    }
  }, [open]);

  const loadRecentItems = async () => {
    try {
      setIsLoading(true);
      // Get recent customers from localStorage
      const recent = localStorage.getItem('recentItems');
      if (recent) {
        setRecentItems(JSON.parse(recent));
      }
    } catch (error) {
      console.error('Error loading recent items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToRecent = (item: RecentItem) => {
    try {
      const recent = localStorage.getItem('recentItems');
      const items: RecentItem[] = recent ? JSON.parse(recent) : [];

      // Remove if already exists
      const filtered = items.filter((i) => i.id !== item.id);

      // Add to beginning
      const updated = [item, ...filtered].slice(0, 10); // Keep only 10

      localStorage.setItem('recentItems', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent item:', error);
    }
  };

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const handleNavigation = (path: string) => {
    runCommand(() => router.push(path));
  };

  const handleRecentItem = (item: RecentItem) => {
    const routes = {
      customer: '/dashboard/customers/',
      order: '/dashboard/orders/',
      quotation: '/dashboard/quotations/',
    };
    runCommand(() => router.push(`${routes[item.type]}${item.id}`));
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Digite um comando ou busque..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        <CommandGroup heading="Ações Rápidas">
          <CommandItem onSelect={() => handleNavigation('/dashboard/customers/new')}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Novo Cliente</span>
            <CommandShortcut>N (em Clientes)</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigation('/dashboard/orders/new')}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Nova Ordem de Serviço</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigation('/dashboard/quotations/new')}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Novo Orçamento</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigation('/dashboard/services/new')}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Novo Serviço</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigation('/dashboard/suppliers/new')}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Novo Fornecedor</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navegação">
          <CommandItem onSelect={() => handleNavigation('/dashboard/main')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigation('/dashboard/customers')}>
            <Users className="mr-2 h-4 w-4" />
            <span>Clientes</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigation('/dashboard/services')}>
            <Wrench className="mr-2 h-4 w-4" />
            <span>Serviços</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigation('/dashboard/quotations')}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Orçamentos</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigation('/dashboard/orders')}>
            <ClipboardList className="mr-2 h-4 w-4" />
            <span>Ordens de Serviço</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigation('/dashboard/schedule')}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Agenda</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigation('/dashboard/financial')}>
            <DollarSign className="mr-2 h-4 w-4" />
            <span>Financeiro - Recebíveis</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigation('/dashboard/suppliers')}>
            <Building2 className="mr-2 h-4 w-4" />
            <span>Fornecedores</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigation('/dashboard/payables')}>
            <Receipt className="mr-2 h-4 w-4" />
            <span>Contas a Pagar</span>
          </CommandItem>
        </CommandGroup>

        {recentItems.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recentes">
              {recentItems.map((item) => (
                <CommandItem key={item.id} onSelect={() => handleRecentItem(item)}>
                  <Search className="mr-2 h-4 w-4" />
                  <span>{item.name}</span>
                  <CommandShortcut>
                    {item.type === 'customer' && 'Cliente'}
                    {item.type === 'order' && 'Ordem'}
                    {item.type === 'quotation' && 'Orçamento'}
                  </CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

// Trigger button for command palette (to be used in header)
export function CommandPaletteTrigger() {
  const { setOpen } = useCommandPalette();

  return (
    <button
      onClick={() => setOpen(true)}
      className="relative flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-64 lg:w-80"
    >
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4" />
        <span>Buscar...</span>
      </div>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}
