# Keyboard Shortcuts - Solid Service ERP

Guia completo de atalhos de teclado implementados no sistema.

## Atalhos Globais

Estes atalhos funcionam em qualquer página do sistema:

| Atalho | Descrição |
|--------|-----------|
| `?` ou `Shift+/` | Abrir ajuda de atalhos de teclado |
| `Esc` | Fechar modais, dialogs e drawers |

## Atalhos por Página

### Clientes (`/dashboard/customers`)

| Atalho | Descrição |
|--------|-----------|
| `n` | Criar novo cliente |
| `/` | Focar no campo de busca |
| `Ctrl+F` | Abrir filtros avançados |

### Novo Cliente (`/dashboard/customers/new`)

| Atalho | Descrição |
|--------|-----------|
| `Ctrl+S` | Salvar cliente |
| `Esc` | Cancelar e voltar para lista |

### Editar Cliente (`/dashboard/customers/[id]/edit`)

| Atalho | Descrição |
|--------|-----------|
| `Ctrl+S` | Salvar alterações |
| `Esc` | Cancelar e voltar |

---

## Como Usar

### Descobrir Atalhos Disponíveis

1. Pressione `?` em qualquer página
2. Um dialog será aberto mostrando todos os atalhos disponíveis
3. Os atalhos são agrupados por categoria para facilitar a navegação

### Navegação Rápida

```
Exemplo de fluxo com atalhos:

1. Na lista de clientes → pressione 'n' para criar novo cliente
2. Preencha o formulário
3. Pressione Ctrl+S para salvar
4. Sistema redireciona automaticamente
```

### Busca Rápida

```
Em qualquer lista:

1. Pressione '/' para focar no campo de busca
2. Digite sua busca
3. Resultados são filtrados em tempo real
```

---

## Convenções de Teclas

### Modificadores

- **Ctrl** no Windows/Linux
- **Cmd** (⌘) no macOS
- **Alt** no Windows/Linux
- **Option** (⌥) no macOS
- **Shift** em todas as plataformas

### Teclas Especiais

- `Esc` - Escape
- `Del` - Delete
- `Enter` - Enter
- `/` - Barra
- `?` - Interrogação

---

## Regras de Comportamento

### 1. Inputs Protegidos

Os atalhos **NÃO** disparam quando você está digitando em:
- Campos de input (`<input>`)
- Áreas de texto (`<textarea>`)
- Elementos editáveis (`contenteditable`)

Isso evita conflitos acidentais durante a digitação.

### 2. Prioridade

Se houver conflito entre atalhos:
- Atalhos da página atual têm prioridade
- Último atalho registrado prevalece
- Sistema avisa sobre conflitos no console

### 3. Prevenção de Padrão

Por padrão, os atalhos previnem o comportamento padrão do navegador.

Exemplo: `Ctrl+S` salva o formulário ao invés de abrir "Salvar página".

---

## Atalhos Planejados

### Próximas Implementações

#### Navegação em Listas
- `j` / `↓` - Mover para próximo item
- `k` / `↑` - Mover para item anterior
- `Enter` - Abrir item selecionado

#### Pedidos (`/dashboard/orders`)
- `n` - Novo pedido
- `e` - Editar pedido selecionado
- `/` - Buscar pedidos

#### Orçamentos (`/dashboard/quotations`)
- `n` - Novo orçamento
- `e` - Editar orçamento selecionado
- `d` - Duplicar orçamento
- `/` - Buscar orçamentos

#### Financeiro
- `n` - Novo lançamento
- `p` - Marcar como pago
- `f` - Filtros avançados

---

## Para Desenvolvedores

### Adicionar Novos Atalhos

```tsx
import { useAutoRegisterShortcuts } from '@/hooks/useKeyboardShortcuts';

function MyPage() {
  useAutoRegisterShortcuts([
    {
      key: 'n',
      callback: () => handleNew(),
      options: {
        description: 'Criar novo item',
        category: 'Ações',
      },
    },
  ], []);
}
```

### Atalho com Modificador

```tsx
{
  key: 's',
  callback: () => handleSave(),
  options: {
    description: 'Salvar',
    category: 'Ações',
    ctrl: true, // Requer Ctrl+S
  },
}
```

### Atalho Condicional

```tsx
useEffect(() => {
  if (!canEdit) return;

  const unregister = registerShortcut('e', handleEdit, {
    description: 'Editar',
    category: 'Ações',
  });

  return unregister;
}, [canEdit]);
```

---

## Acessibilidade

### Boas Práticas

1. **Sempre forneça descrições claras** nos atalhos
2. **Use categorias consistentes** para organização
3. **Documente atalhos visualmente** quando relevante
4. **Não bloqueie navegação por teclado** nativa
5. **Teste com leitores de tela**

### ARIA

O dialog de ajuda inclui:
- Rótulos ARIA apropriados
- Navegação por teclado
- Foco gerenciado corretamente

---

## Troubleshooting

### Atalho não funciona

**Problema**: Pressiono o atalho mas nada acontece

**Soluções**:
1. Verifique se não está em um campo de input
2. Pressione `?` para ver se o atalho está registrado
3. Verifique o console para avisos de conflito
4. Recarregue a página

### Conflito com navegador

**Problema**: Atalho abre funcionalidade do navegador

**Soluções**:
1. Escolha outra tecla
2. Adicione modificador (Ctrl, Alt, Shift)
3. Use preventDefault: true nas options

### Atalho sumiu após navegação

**Problema**: Atalhos desaparecem ao mudar de página

**Causa**: Atalhos são contextuais à página atual

**Solução**: Cada página registra seus próprios atalhos

---

## Estatísticas

- **Atalhos Globais**: 2
- **Páginas com Atalhos**: 3
- **Total de Atalhos**: 8+
- **Categorias**: 2 (Navegação, Ações)

---

## Feedback

Encontrou um problema ou tem sugestão de atalho?

1. Abra uma issue no repositório
2. Sugira melhorias no sistema
3. Contribua com novos atalhos

---

## Referências

- **Provider**: `KeyboardShortcutsProvider.tsx`
- **Dialog**: `KeyboardShortcutsDialog.tsx`
- **Hook**: `useKeyboardShortcuts.ts`
- **Tipos**: `types.ts`
- **Documentação**: `keyboard-shortcuts/README.md`

---

**Última atualização**: 2026-03-19

**Versão**: 1.0.0
