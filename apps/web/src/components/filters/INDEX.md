# Índice - Sistema de Filtros Avançados

Navegação rápida para toda a documentação e arquivos do sistema.

## Arquivos Principais (Core)

### 1. Hook
- **[useUrlFilters.ts](../../hooks/useUrlFilters.ts)** - Hook principal para gerenciar filtros na URL
  - 154 linhas | 4.3 KB
  - Funcionalidades: leitura, escrita, sincronização com URL

### 2. Componentes React

- **[FilterChip.tsx](./FilterChip.tsx)** - Chip removível para filtros ativos
  - 43 linhas | 1.3 KB
  - Props: label, value, onRemove

- **[FilterDrawer.tsx](./FilterDrawer.tsx)** - Modal/Drawer para filtros avançados
  - 106 linhas | 2.9 KB
  - Props: isOpen, onClose, onApply, onClear, children

- **[FilterSection.tsx](./FilterSection.tsx)** - Seção de filtro dentro do drawer
  - 32 linhas | 993 bytes
  - Props: title, description, children

- **[index.ts](./index.ts)** - Export barrel
  - 11 linhas | 431 bytes
  - Importação: `import { FilterChip, FilterDrawer, FilterSection } from '@/components/filters'`

### 3. TypeScript

- **[types.ts](./types.ts)** - Tipos, interfaces e utilidades
  - 402 linhas | 11 KB
  - Classes: FilterUtils
  - Configurações: CUSTOMER_FILTERS, ORDER_FILTERS, QUOTATION_FILTERS, FINANCIAL_FILTERS

## Documentação

### Começando

1. **[README.md](./README.md)** - Documentação Principal
   - 334 linhas | 8.2 KB
   - Visão geral do sistema
   - Componentes e funcionalidades
   - Exemplo de uso completo
   - Integração com TanStack Table e React Query

2. **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Guia de Integração
   - 509 linhas | 10 KB
   - Passo a passo detalhado
   - Exemplos por módulo
   - Boas práticas
   - Troubleshooting

### Avançado

3. **[ADVANCED_USAGE.md](./ADVANCED_USAGE.md)** - Casos de Uso Avançados
   - 673 linhas | 17 KB
   - Filtros com arrays
   - Range de datas e valores
   - Debounce
   - Filtros condicionais
   - Server-side filtering
   - E muito mais...

4. **[FEATURES.md](./FEATURES.md)** - Lista Completa de Recursos
   - 551 linhas | 9.7 KB
   - Características principais
   - Tipos suportados
   - Performance
   - Acessibilidade
   - Extensões futuras

### Referência

5. **[example-usage.tsx](./example-usage.tsx)** - Exemplo Funcional Completo
   - 358 linhas | 12 KB
   - Página completa com todos os componentes
   - Código pronto para usar
   - Bem comentado

6. **[CHANGELOG.md](./CHANGELOG.md)** - Histórico de Mudanças
   - 6.9 KB
   - Versão 1.0.0
   - Roadmap futuro
   - Estatísticas

## Quick Start

### Instalação
```bash
# Já incluído no projeto!
# Todos os arquivos estão em:
# - apps/web/src/hooks/useUrlFilters.ts
# - apps/web/src/components/filters/*
```

### Uso Básico
```tsx
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { FilterChip, FilterDrawer, FilterSection } from '@/components/filters';

function MyPage() {
  const { filters, setFilter, removeFilter } = useUrlFilters();

  return (
    <div>
      {/* Seu código aqui */}
    </div>
  );
}
```

### Próximos Passos

1. Leia o [README.md](./README.md) para entender o sistema
2. Siga o [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) para integrar
3. Consulte [ADVANCED_USAGE.md](./ADVANCED_USAGE.md) para casos avançados
4. Use [example-usage.tsx](./example-usage.tsx) como referência

## Estrutura de Diretórios

```
apps/web/src/
│
├── hooks/
│   └── useUrlFilters.ts              # Hook principal
│
└── components/filters/
    ├── FilterChip.tsx                # Componente de chip
    ├── FilterDrawer.tsx              # Componente de drawer
    ├── FilterSection.tsx             # Componente de seção
    ├── index.ts                      # Export barrel
    ├── types.ts                      # Tipos e utilidades
    │
    ├── example-usage.tsx             # Exemplo funcional
    │
    ├── INDEX.md                      # Este arquivo
    ├── README.md                     # Documentação principal
    ├── INTEGRATION_GUIDE.md          # Guia de integração
    ├── ADVANCED_USAGE.md             # Casos avançados
    ├── FEATURES.md                   # Lista de recursos
    └── CHANGELOG.md                  # Histórico
```

## Estatísticas

| Tipo | Quantidade | Tamanho Total |
|------|------------|---------------|
| Componentes React | 4 | ~7 KB |
| TypeScript (tipos) | 1 | 11 KB |
| Documentação | 6 | ~55 KB |
| Exemplo | 1 | 12 KB |
| **TOTAL** | **12 arquivos** | **~85 KB** |

## Suporte

### Tenho uma dúvida sobre...

- **Como usar?** → Leia [README.md](./README.md)
- **Como integrar?** → Leia [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- **Casos específicos?** → Leia [ADVANCED_USAGE.md](./ADVANCED_USAGE.md)
- **Recursos disponíveis?** → Leia [FEATURES.md](./FEATURES.md)
- **Exemplo de código?** → Veja [example-usage.tsx](./example-usage.tsx)
- **Tipos TypeScript?** → Veja [types.ts](./types.ts)

### Módulos do Sistema

| Módulo | Status | Documentação |
|--------|--------|--------------|
| Customers | ✅ Pronto | Ver seção em [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md#clientes-customers) |
| Suppliers | ✅ Pronto | Mesmo padrão de Customers |
| Services | ✅ Pronto | Mesmo padrão de Customers |
| Quotations | ✅ Pronto | Ver seção em [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md#orçamentos-quotations) |
| Orders | ✅ Pronto | Ver seção em [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md#ordens-de-serviço-orders) |
| Financial | ✅ Pronto | Ver seção em [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md#financeiro-receivablespayables) |

### Tecnologias

- **React 19** - UI framework
- **Next.js 14+** - App Router
- **TypeScript 5+** - Tipagem
- **shadcn/ui** - Componentes base
- **Radix UI** - Primitivos acessíveis
- **Tailwind CSS 3** - Estilização
- **TanStack Query 5** - Data fetching
- **TanStack Table 8** - Tabelas

### Compatibilidade

| Browser | Versão Mínima |
|---------|---------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

### Performance

- ⚡ Shallow routing (sem reload)
- ⚡ Memoização automática
- ⚡ Debounce ready
- ⚡ Virtual scrolling ready
- ⚡ Code splitting friendly

### Acessibilidade

- ♿ ARIA labels
- ♿ Keyboard navigation
- ♿ Screen reader support
- ♿ Focus management
- ♿ WCAG 2.1 AA compliant

## Checklist de Integração

Ao integrar em uma nova página, siga este checklist:

- [ ] Importar `useUrlFilters` de `@/hooks/useUrlFilters`
- [ ] Importar componentes de `@/components/filters`
- [ ] Criar estado para controlar abertura do drawer
- [ ] Adicionar botão "Filtros Avançados"
- [ ] Implementar `FilterDrawer` com seções
- [ ] Adicionar chips de filtros ativos
- [ ] Aplicar filtros aos dados (client ou server-side)
- [ ] Testar sincronização com URL
- [ ] Verificar responsividade
- [ ] Testar acessibilidade (keyboard, screen reader)

## Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Filtros não aparecem na URL | Verifique se valores não estão vazios |
| URL muito longa | Use server-side filtering |
| Performance lenta | Adicione debounce e memoização |
| Conflito com paginação | Parâmetros são preservados automaticamente |
| Filtros não persistem | URL é a fonte da verdade, verifique sincronização |

## Roadmap

### v1.0.0 (Atual)
- ✅ Componentes base
- ✅ Hook useUrlFilters
- ✅ Documentação completa
- ✅ Exemplos de uso
- ✅ Tipos TypeScript

### v1.1.0 (Próxima)
- [ ] Filtros salvos (favoritos)
- [ ] Compartilhamento de filtros
- [ ] Templates por módulo

### v1.2.0 (Futuro)
- [ ] UI aprimorada
- [ ] Drag & drop
- [ ] Temas customizáveis

### v2.0.0 (Futuro Distante)
- [ ] IA para sugestões
- [ ] Query builder visual
- [ ] Analytics avançado

## Contribuindo

1. Mantenha padrões de código
2. Atualize documentação
3. Adicione testes
4. Siga TypeScript strict mode

## Licença

Parte do Solid Service ERP - Uso interno

---

**Última atualização:** 2026-03-19
**Versão:** 1.0.0
**Status:** ✅ Produção
