/**
 * Tipos e Utilidades para Sistema de Filtros
 *
 * Centraliza definições de tipos para manter consistência
 */

// Tipos base de filtros
export type FilterValue = string | string[] | number | boolean | null | undefined;
export type Filters = Record<string, FilterValue>;

// Operadores de comparação para filtros numéricos/data
export type ComparisonOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin';

// Configuração de um filtro individual
export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'numberrange' | 'boolean';
  options?: FilterOption[];
  placeholder?: string;
  defaultValue?: FilterValue;
  validation?: (value: FilterValue) => boolean | string;
}

// Opção de filtro (para selects)
export interface FilterOption {
  label: string;
  value: string | number;
  count?: number; // Número de resultados com este filtro
  disabled?: boolean;
}

// Filtro salvo pelo usuário
export interface SavedFilter {
  id: string;
  name: string;
  filters: Filters;
  createdAt: string;
  isDefault?: boolean;
}

// Metadados de filtros (para analytics)
export interface FilterMetadata {
  totalResults: number;
  filteredResults: number;
  activeFilters: number;
  appliedAt: string;
}

// Props para componentes de filtro customizados
export interface CustomFilterProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  onRemove: () => void;
  config: FilterConfig;
}

/**
 * Utilidades para trabalhar com filtros
 */

export class FilterUtils {
  /**
   * Converte filtros para query string
   */
  static toQueryString(filters: Filters): string {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return;
      }

      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.append(key, value.join(','));
        }
      } else {
        params.append(key, String(value));
      }
    });

    return params.toString();
  }

  /**
   * Parse query string para objeto de filtros
   */
  static fromQueryString(queryString: string): Filters {
    const params = new URLSearchParams(queryString);
    const filters: Filters = {};

    params.forEach((value, key) => {
      if (value.includes(',')) {
        filters[key] = value.split(',').filter(Boolean);
      } else if (value === 'true') {
        filters[key] = true;
      } else if (value === 'false') {
        filters[key] = false;
      } else if (!isNaN(Number(value)) && value !== '') {
        filters[key] = Number(value);
      } else {
        filters[key] = value;
      }
    });

    return filters;
  }

  /**
   * Mescla filtros preservando valores existentes
   */
  static merge(current: Filters, updates: Filters): Filters {
    return { ...current, ...updates };
  }

  /**
   * Remove valores vazios
   */
  static clean(filters: Filters): Filters {
    const cleaned: Filters = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value) && value.length === 0) {
          return;
        }
        cleaned[key] = value;
      }
    });

    return cleaned;
  }

  /**
   * Compara dois objetos de filtros
   */
  static equals(a: Filters, b: Filters): boolean {
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();

    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every(key => {
      const aValue = a[key];
      const bValue = b[key];

      if (Array.isArray(aValue) && Array.isArray(bValue)) {
        return (
          aValue.length === bValue.length &&
          aValue.every((v, i) => v === bValue[i])
        );
      }

      return aValue === bValue;
    });
  }

  /**
   * Obtém label legível para filtro
   */
  static getLabel(key: string, value: FilterValue, configs: FilterConfig[]): string {
    const config = configs.find(c => c.key === key);

    if (!config) return String(value);

    if (Array.isArray(value)) {
      return value.map(v => {
        const option = config.options?.find(o => o.value === v);
        return option?.label || String(v);
      }).join(', ');
    }

    const option = config.options?.find(o => o.value === value);
    return option?.label || String(value);
  }

  /**
   * Valida filtros com base em configuração
   */
  static validate(filters: Filters, configs: FilterConfig[]): Record<string, string> {
    const errors: Record<string, string> = {};

    Object.entries(filters).forEach(([key, value]) => {
      const config = configs.find(c => c.key === key);

      if (config?.validation) {
        const result = config.validation(value);
        if (typeof result === 'string') {
          errors[key] = result;
        }
      }
    });

    return errors;
  }

  /**
   * Aplica filtros a um array de dados (client-side)
   */
  static apply<T extends Record<string, any>>(
    data: T[],
    filters: Filters,
    configs?: FilterConfig[]
  ): T[] {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined) return true;

        const itemValue = item[key];

        // Array (múltiplos valores)
        if (Array.isArray(value)) {
          return value.includes(itemValue);
        }

        // String (contains)
        if (typeof value === 'string' && typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase());
        }

        // Outros tipos (igualdade)
        return itemValue === value;
      });
    });
  }

  /**
   * Gera contadores para cada opção de filtro
   */
  static getCounts<T extends Record<string, any>>(
    data: T[],
    config: FilterConfig
  ): Record<string, number> {
    const counts: Record<string, number> = {};

    if (!config.options) return counts;

    config.options.forEach(option => {
      counts[String(option.value)] = data.filter(
        item => item[config.key] === option.value
      ).length;
    });

    return counts;
  }

  /**
   * Salva filtros no localStorage
   */
  static saveToStorage(key: string, filters: Filters): void {
    try {
      localStorage.setItem(key, JSON.stringify(filters));
    } catch (error) {
      console.error('Erro ao salvar filtros:', error);
    }
  }

  /**
   * Carrega filtros do localStorage
   */
  static loadFromStorage(key: string): Filters | null {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Erro ao carregar filtros:', error);
      return null;
    }
  }

  /**
   * Remove filtros do localStorage
   */
  static clearStorage(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Erro ao limpar filtros:', error);
    }
  }
}

/**
 * Configurações de filtros por módulo (exemplos)
 */

export const CUSTOMER_FILTERS: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Ativo', value: 'active' },
      { label: 'Inativo', value: 'inactive' },
    ],
  },
  {
    key: 'type',
    label: 'Tipo',
    type: 'select',
    options: [
      { label: 'Empresa', value: 'company' },
      { label: 'Pessoa Física', value: 'individual' },
    ],
  },
  {
    key: 'search',
    label: 'Busca',
    type: 'text',
    placeholder: 'Buscar por nome ou documento...',
  },
];

export const QUOTATION_FILTERS: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'multiselect',
    options: [
      { label: 'Rascunho', value: 'draft' },
      { label: 'Enviado', value: 'sent' },
      { label: 'Aprovado', value: 'approved' },
      { label: 'Rejeitado', value: 'rejected' },
    ],
  },
  {
    key: 'dateRange',
    label: 'Período',
    type: 'daterange',
  },
  {
    key: 'valueRange',
    label: 'Valor',
    type: 'numberrange',
    validation: (value) => {
      if (typeof value === 'number' && value < 0) {
        return 'Valor não pode ser negativo';
      }
      return true;
    },
  },
];

export const ORDER_FILTERS: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'multiselect',
    options: [
      { label: 'Aberto', value: 'open' },
      { label: 'Agendado', value: 'scheduled' },
      { label: 'Em Andamento', value: 'in_progress' },
      { label: 'Concluído', value: 'completed' },
      { label: 'Cancelado', value: 'cancelled' },
    ],
  },
  {
    key: 'priority',
    label: 'Prioridade',
    type: 'select',
    options: [
      { label: 'Baixa', value: 'low' },
      { label: 'Média', value: 'medium' },
      { label: 'Alta', value: 'high' },
      { label: 'Urgente', value: 'urgent' },
    ],
  },
  {
    key: 'scheduledDate',
    label: 'Data Agendada',
    type: 'daterange',
  },
];

export const FINANCIAL_FILTERS: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'multiselect',
    options: [
      { label: 'Pendente', value: 'pending' },
      { label: 'Pago', value: 'paid' },
      { label: 'Vencido', value: 'overdue' },
      { label: 'Cancelado', value: 'cancelled' },
    ],
  },
  {
    key: 'paymentMethod',
    label: 'Forma de Pagamento',
    type: 'multiselect',
    options: [
      { label: 'Cartão de Crédito', value: 'credit_card' },
      { label: 'Cartão de Débito', value: 'debit_card' },
      { label: 'PIX', value: 'pix' },
      { label: 'Dinheiro', value: 'cash' },
      { label: 'Transferência', value: 'bank_transfer' },
    ],
  },
  {
    key: 'dueDate',
    label: 'Data de Vencimento',
    type: 'daterange',
  },
  {
    key: 'amount',
    label: 'Valor',
    type: 'numberrange',
  },
];

/**
 * Type guards
 */

export function isFilterValue(value: unknown): value is FilterValue {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    (Array.isArray(value) && value.every(v => typeof v === 'string'))
  );
}

export function isFilters(obj: unknown): obj is Filters {
  if (typeof obj !== 'object' || obj === null) return false;

  return Object.values(obj).every(isFilterValue);
}
