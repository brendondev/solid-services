# Recursos do Sistema de Filtros Avançados

## Características Principais

### 1. Sincronização com URL
- Filtros são automaticamente sincronizados com query params da URL
- Permite compartilhamento de URLs com filtros aplicados
- Navegação back/forward funciona perfeitamente
- Refresh da página mantém filtros ativos
- Shallow routing (sem reload da página)

**Exemplo de URL gerada:**
```
/dashboard/customers?status=active&type=company
/dashboard/orders?status=open,in_progress&priority=high
/dashboard/financial?status=pending&dueDateFrom=2024-01-01&dueDateTo=2024-12-31
```

### 2. Tipos de Filtros Suportados

#### String
```tsx
setFilter('search', 'João Silva');
// URL: ?search=João Silva
```

#### Number
```tsx
setFilter('minValue', 1000);
setFilter('maxValue', 5000);
// URL: ?minValue=1000&maxValue=5000
```

#### Boolean
```tsx
setFilter('isActive', true);
// URL: ?isActive=true
```

#### Arrays (múltiplos valores)
```tsx
setFilter('status', ['active', 'pending']);
// URL: ?status=active,pending
```

### 3. Componentes Incluídos

#### useUrlFilters (Hook)
```tsx
const {
  filters,           // Objeto com filtros ativos
  setFilter,         // Define um filtro
  removeFilter,      // Remove um filtro
  clearFilters,      // Limpa todos os filtros
  hasActiveFilters,  // Boolean indicando se há filtros
} = useUrlFilters();
```

#### FilterChip
```tsx
<FilterChip
  label="Status"
  value="Ativo"
  onRemove={() => removeFilter('status')}
/>
```

Renderiza:
```
┌─────────────────┐
│ Status: Ativo ✕ │
└─────────────────┘
```

#### FilterDrawer
```tsx
<FilterDrawer
  isOpen={showFilters}
  onClose={() => setShowFilters(false)}
  onClear={clearFilters}
>
  {/* Seções de filtro */}
</FilterDrawer>
```

Layout:
```
┌────────────────────────────────┐
│ Filtros Avançados          ✕  │
│ Refine sua busca...            │
├────────────────────────────────┤
│                                │
│  [Seção 1: Status]             │
│  [Seção 2: Tipo]               │
│  [Seção 3: Período]            │
│                                │
├────────────────────────────────┤
│           [Limpar] [Aplicar]   │
└────────────────────────────────┘
```

#### FilterSection
```tsx
<FilterSection
  title="Status do Cliente"
  description="Filtrar por status ativo ou inativo"
>
  {/* Inputs de filtro */}
</FilterSection>
```

### 4. Responsividade

#### Desktop (> 768px)
- Modal centralizado
- Largura máxima: 672px
- Altura máxima: 90vh
- Scrollável internamente

#### Mobile (< 768px)
- Drawer desliza de baixo
- Ocupa largura total
- Altura adaptativa
- Touch-friendly

### 5. Integração com React Query

```tsx
const { filters } = useUrlFilters();

const { data, isLoading } = useQuery({
  queryKey: ['customers', filters],
  queryFn: () => api.findAll(filters),
});

// Refetch automático quando filtros mudam!
```

### 6. Preservação de Parâmetros

Os seguintes parâmetros são automaticamente preservados:
- `page` - Página atual
- `limit` - Itens por página
- `offset` - Offset de paginação

Exemplo:
```
Antes:  /customers?page=2&status=active
Depois: /customers?page=2&status=active&type=company
        (page=2 foi preservado)
```

### 7. Validação Automática

#### Valores vazios são removidos
```tsx
setFilter('status', '');    // Remove da URL
setFilter('status', null);  // Remove da URL
setFilter('status', []);    // Remove da URL
```

#### Conversão de tipos
```tsx
// URL: ?active=true&age=25&tags=a,b,c

filters.active  // boolean: true
filters.age     // number: 25
filters.tags    // array: ['a', 'b', 'c']
```

### 8. Performance

#### Memoização
- Filtros são memoizados usando `useMemo`
- Atualização de URL usa `useCallback`
- Evita re-renders desnecessários

#### Debounce (opcional)
```tsx
const debouncedSearch = useDebounce(search, 300);

useEffect(() => {
  setFilter('search', debouncedSearch);
}, [debouncedSearch]);
```

#### Shallow Routing
```tsx
router.replace(newUrl, { scroll: false });
// Não recarrega página
// Não volta ao topo
```

### 9. Acessibilidade (a11y)

#### ARIA Labels
```tsx
<button aria-label="Remover filtro Status">
  <X className="h-4 w-4" />
</button>
```

#### Keyboard Navigation
- `Tab` - Navega entre filtros
- `Enter` / `Space` - Ativa/desativa
- `Esc` - Fecha drawer

#### Screen Readers
```tsx
<span className="sr-only">Filtros ativos</span>
```

### 10. Estados Visuais

#### Botão sem filtros
```
┌───────────────────────┐
│ 🔍 Filtros Avançados  │
└───────────────────────┘
```

#### Botão com filtros (badge)
```
┌───────────────────────┐
│ 🔍 Filtros Avançados ③│
└───────────────────────┘
```

#### Chips ativos
```
Filtros ativos:  [Status: Ativo ✕]  [Tipo: Empresa ✕]  [Limpar tudo]
```

#### Empty state
```
Nenhum resultado encontrado com os filtros selecionados.
                    [Limpar filtros]
```

### 11. Casos de Uso

#### Busca Simples
```tsx
<Input
  placeholder="Buscar..."
  value={filters.search}
  onChange={(e) => setFilter('search', e.target.value)}
/>
```

#### Select Único
```tsx
<Select
  value={filters.status}
  onValueChange={(value) => setFilter('status', value)}
>
  <SelectItem value="active">Ativo</SelectItem>
  <SelectItem value="inactive">Inativo</SelectItem>
</Select>
```

#### Checkboxes (Radio-like)
```tsx
<Checkbox
  checked={filters.type === 'company'}
  onCheckedChange={(checked) => {
    if (checked) setFilter('type', 'company');
    else removeFilter('type');
  }}
>
  Empresa
</Checkbox>
```

#### Múltiplos Valores
```tsx
const toggleArrayFilter = (value) => {
  const current = filters.tags || [];
  const newTags = current.includes(value)
    ? current.filter(t => t !== value)
    : [...current, value];
  setFilter('tags', newTags);
};

<Checkbox
  checked={filters.tags?.includes('urgent')}
  onCheckedChange={() => toggleArrayFilter('urgent')}
>
  Urgente
</Checkbox>
```

#### Range de Valores
```tsx
<Input
  type="number"
  placeholder="Mín"
  value={filters.minValue}
  onChange={(e) => setFilter('minValue', Number(e.target.value))}
/>
<Input
  type="number"
  placeholder="Máx"
  value={filters.maxValue}
  onChange={(e) => setFilter('maxValue', Number(e.target.value))}
/>
```

#### Range de Datas
```tsx
<Input
  type="date"
  value={filters.dateFrom}
  onChange={(e) => setFilter('dateFrom', e.target.value)}
/>
<Input
  type="date"
  value={filters.dateTo}
  onChange={(e) => setFilter('dateTo', e.target.value)}
/>
```

### 12. Boas Práticas

#### ✅ Fazer

- Usar labels descritivos nos chips
- Validar valores antes de setar filtros
- Limpar filtros relacionados ao mudar outros
- Mostrar contador de resultados
- Indicar filtros ativos visualmente
- Permitir limpar todos os filtros
- Preservar parâmetros de paginação

#### ❌ Evitar

- Não aplicar muitos filtros ao mesmo tempo
- Não usar filtros para dados sensíveis na URL
- Não esquecer de memoizar dados filtrados
- Não ignorar validação de tipos
- Não usar valores muito longos em arrays

### 13. Exemplos de Integração

#### Com TanStack Table
```tsx
const table = useReactTable({
  data: filteredData,
  columns,
  state: {
    columnFilters: Object.entries(filters).map(([id, value]) => ({
      id,
      value,
    })),
  },
});
```

#### Com Backend (API)
```tsx
// Frontend
const { filters } = useUrlFilters();
const { data } = useQuery({
  queryKey: ['items', filters],
  queryFn: () => api.findAll(filters),
});

// Backend (Next.js API)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filters = Object.fromEntries(searchParams);

  const items = await db.item.findMany({
    where: buildWhereClause(filters),
  });

  return Response.json(items);
}
```

### 14. Extensões Futuras

Recursos que podem ser adicionados:

- [ ] Filtros salvos por usuário (favoritos)
- [ ] Filtros compartilháveis (link curto)
- [ ] Histórico de filtros aplicados
- [ ] Sugestões inteligentes
- [ ] Filtros baseados em IA
- [ ] Exportar com filtros aplicados
- [ ] Templates de filtros por módulo
- [ ] Drag & drop para reordenar filtros
- [ ] Filtros condicionais (dependentes)
- [ ] Analytics de filtros mais usados

### 15. Métricas e Analytics

Dados que podem ser coletados:

```tsx
// Rastrear uso de filtros
const trackFilterUsage = (key: string, value: FilterValue) => {
  analytics.track('filter_applied', {
    filter_key: key,
    filter_value: value,
    page: pathname,
    timestamp: new Date(),
  });
};
```

### 16. Testes

Cenários de teste importantes:

```tsx
// Hook
✓ Deve ler filtros da URL
✓ Deve atualizar URL ao setar filtro
✓ Deve remover filtro da URL
✓ Deve limpar todos os filtros
✓ Deve preservar parâmetros de paginação
✓ Deve converter tipos corretamente

// Componentes
✓ FilterChip deve renderizar label e value
✓ FilterChip deve chamar onRemove ao clicar X
✓ FilterDrawer deve abrir/fechar
✓ FilterDrawer deve aplicar filtros
✓ FilterSection deve renderizar título e children
```

## Conclusão

Sistema completo, robusto e reutilizável de filtros para o Solid Service ERP com:

- ✅ Sincronização com URL
- ✅ TypeScript completo
- ✅ Responsivo
- ✅ Acessível
- ✅ Performático
- ✅ Extensível
- ✅ Bem documentado
- ✅ Fácil de usar

Pronto para ser integrado em qualquer página do sistema!
