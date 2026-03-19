'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export type FilterValue = string | string[] | number | boolean | null | undefined;
export type Filters = Record<string, FilterValue>;

interface UseUrlFiltersReturn {
  filters: Filters;
  setFilter: (key: string, value: FilterValue) => void;
  removeFilter: (key: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

/**
 * Hook customizado para gerenciar filtros na URL usando query params
 *
 * Funcionalidades:
 * - Lê filtros da URL (query params)
 * - Atualiza URL quando filtros mudam (usando shallow routing)
 * - Mantém sincronização entre estado e URL
 * - Remove params vazios automaticamente
 *
 * @example
 * ```tsx
 * const { filters, setFilter, removeFilter, clearFilters } = useUrlFilters();
 *
 * // Definir filtro
 * setFilter('status', 'active');
 *
 * // Remover filtro
 * removeFilter('status');
 *
 * // Limpar todos
 * clearFilters();
 *
 * // Verificar valor
 * console.log(filters.status); // 'active'
 * ```
 */
export function useUrlFilters(): UseUrlFiltersReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Converte searchParams em objeto de filtros
  const filters = useMemo(() => {
    const params: Filters = {};

    searchParams.forEach((value, key) => {
      // Ignora parâmetros de paginação comuns
      if (key === 'page' || key === 'limit' || key === 'offset') {
        return;
      }

      // Tenta parsear arrays (values separados por vírgula)
      if (value.includes(',')) {
        params[key] = value.split(',').filter(Boolean);
      } else {
        // Tenta converter para tipos primitivos
        if (value === 'true') {
          params[key] = true;
        } else if (value === 'false') {
          params[key] = false;
        } else if (!isNaN(Number(value)) && value !== '') {
          params[key] = Number(value);
        } else {
          params[key] = value;
        }
      }
    });

    return params;
  }, [searchParams]);

  // Atualiza a URL com os novos params (shallow routing)
  const updateUrl = useCallback((newFilters: Filters) => {
    const params = new URLSearchParams(searchParams.toString());

    // Remove todos os filtros existentes (mas mantém paginação)
    const paginationParams: Record<string, string> = {};
    ['page', 'limit', 'offset'].forEach((key) => {
      const value = params.get(key);
      if (value) paginationParams[key] = value;
    });

    // Limpa todos os params
    params.forEach((_, key) => {
      params.delete(key);
    });

    // Re-adiciona paginação
    Object.entries(paginationParams).forEach(([key, value]) => {
      params.set(key, value);
    });

    // Adiciona novos filtros
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return; // Ignora valores vazios
      }

      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.set(key, value.join(','));
        }
      } else {
        params.set(key, String(value));
      }
    });

    // Atualiza URL sem recarregar a página (shallow routing)
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.replace(newUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  // Define um filtro específico
  const setFilter = useCallback((key: string, value: FilterValue) => {
    const newFilters = { ...filters };

    if (value === null || value === undefined || value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }

    updateUrl(newFilters);
  }, [filters, updateUrl]);

  // Remove um filtro específico
  const removeFilter = useCallback((key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    updateUrl(newFilters);
  }, [filters, updateUrl]);

  // Limpa todos os filtros
  const clearFilters = useCallback(() => {
    updateUrl({});
  }, [updateUrl]);

  // Verifica se há filtros ativos
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).length > 0;
  }, [filters]);

  return {
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    hasActiveFilters,
  };
}
