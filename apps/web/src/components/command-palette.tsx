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
  MessageCircle,
  Crown,
  Truck,
} from 'lucide-react';
import { customersApi } from '@/lib/api/customers';
import { servicesApi } from '@/lib/api/services';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface RecentItem {
  id: string;
  name: string;
  type: 'customer' | 'order' | 'quotation' | 'service';
}

interface SearchResult {
  id: string;
  name: string;
  type: 'customer' | 'order' | 'quotation' | 'service';
  subtitle?: string;
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
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Load recent items when opening
  useEffect(() => {
    if (open) {
      loadRecentItems();
      setSearch('');
      setSearchResults([]);
    }
  }, [open]);

  // Search entities when user types
  useEffect(() => {
    const searchEntities = async () => {
      if (!search || search.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Search in parallel
        const [customers, orders, quotations, services] = await Promise.all([
          axios.get(`${API_URL}/customers`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${API_URL}/service-orders`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${API_URL}/quotations`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${API_URL}/services`, { headers }).catch(() => ({ data: [] })),
        ]);

        const results: SearchResult[] = [];

        // Filter customers
        customers.data
          .filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()))
          .slice(0, 3)
          .forEach((c: any) => {
            results.push({
              id: c.id,
              name: c.name,
              type: 'customer',
              subtitle: c.document || c.contacts?.[0]?.email,
            });
          });

        // Filter orders
        orders.data
          .filter((o: any) =>
            o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
            o.description?.toLowerCase().includes(search.toLowerCase())
          )
          .slice(0, 3)
          .forEach((o: any) => {
            results.push({
              id: o.id,
              name: `OS #${o.id.slice(0, 8)} - ${o.customer?.name || 'Cliente'}`,
              type: 'order',
              subtitle: o.status,
            });
          });

        // Filter quotations
        quotations.data
          .filter((q: any) =>
            q.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
            q.description?.toLowerCase().includes(search.toLowerCase())
          )
          .slice(0, 3)
          .forEach((q: any) => {
            results.push({
              id: q.id,
              name: `Orçamento #${q.id.slice(0, 8)} - ${q.customer?.name || 'Cliente'}`,
              type: 'quotation',
              subtitle: q.status,
            });
          });

        // Filter services
        services.data
          .filter((s: any) => s.name.toLowerCase().includes(search.toLowerCase()))
          .slice(0, 3)
          .forEach((s: any) => {
            results.push({
              id: s.id,
              name: s.name,
              type: 'service',
              subtitle: s.description,
            });
          });

        setSearchResults(results);
      } catch (error) {
        console.error('Error searching entities:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchEntities, 300);
    return () => clearTimeout(debounce);
  }, [search]);

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

  const handleRecentItem = (item: RecentItem | SearchResult) => {
    const routes = {
      customer: '/dashboard/customers/',
      order: '/dashboard/orders/',
      quotation: '/dashboard/quotations/',
      service: '/dashboard/services/',
    };
    runCommand(() => {
      router.push(`${routes[item.type]}${item.id}`);
      addToRecent({ id: item.id, name: item.name, type: item.type });
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return Users;
      case 'order':
        return ClipboardList;
      case 'quotation':
        return FileText;
      case 'service':
        return Wrench;
      default:
        return Search;
    }
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

        {/* Search results */}
        {searchResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Resultados da Busca">
              {searchResults.map((result) => {
                const Icon = getIcon(result.type);
                return (
                  <CommandItem key={result.id} onSelect={() => handleRecentItem(result)}>
                    <Icon className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{result.name}</span>
                      {result.subtitle && (
                        <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}

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
          <CommandItem onSelect={() => handleNavigation('/dashboard/chat')}>
            <MessageCircle className="mr-2 h-4 w-4" />
            <span>Chat</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigation('/dashboard/financial')}>
            <DollarSign className="mr-2 h-4 w-4" />
            <span>Financeiro - Recebíveis</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigation('/dashboard/suppliers')}>
            <Truck className="mr-2 h-4 w-4" />
            <span>Fornecedores</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigation('/dashboard/payables')}>
            <Receipt className="mr-2 h-4 w-4" />
            <span>Contas a Pagar</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigation('/dashboard/planos')}>
            <Crown className="mr-2 h-4 w-4" />
            <span>Planos e Assinatura</span>
          </CommandItem>
        </CommandGroup>

        {recentItems.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recentes">
              {recentItems.map((item) => {
                const Icon = getIcon(item.type);
                return (
                  <CommandItem key={item.id} onSelect={() => handleRecentItem(item)}>
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.name}</span>
                    <CommandShortcut>
                      {item.type === 'customer' && 'Cliente'}
                      {item.type === 'order' && 'Ordem'}
                      {item.type === 'quotation' && 'Orçamento'}
                      {item.type === 'service' && 'Serviço'}
                    </CommandShortcut>
                  </CommandItem>
                );
              })}
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
