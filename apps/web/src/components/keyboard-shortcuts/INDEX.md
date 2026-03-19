# Keyboard Shortcuts - Índice da Documentação

Índice completo de toda a documentação do sistema de atalhos de teclado.

## Arquivos do Sistema

### Core Components

| Arquivo | Descrição | Linhas |
|---------|-----------|--------|
| `types.ts` | Definições TypeScript | ~80 |
| `KeyboardShortcutsProvider.tsx` | Context Provider | ~230 |
| `KeyboardShortcutsDialog.tsx` | Help Modal | ~200 |
| `index.ts` | Barrel exports | ~30 |

### Hooks

| Arquivo | Descrição | Linhas |
|---------|-----------|--------|
| `../hooks/useKeyboardShortcuts.ts` | Custom hooks | ~200 |

### Documentação

| Arquivo | Descrição | Páginas |
|---------|-----------|---------|
| `README.md` | Documentação técnica | 5 |
| `EXAMPLES.md` | Exemplos práticos | 8 |
| `VISUAL_GUIDE.md` | Guia visual/fluxogramas | 6 |
| `TESTING.md` | Guia de testes | 7 |
| `INDEX.md` | Este arquivo | 1 |

### User Documentation

| Arquivo | Descrição | Páginas |
|---------|-----------|---------|
| `../../docs/KEYBOARD_SHORTCUTS.md` | Guia do usuário | 4 |
| `../KEYBOARD_SHORTCUTS_TODO.md` | Implementações pendentes | 5 |
| `../../KEYBOARD_SHORTCUTS_SUMMARY.md` | Resumo geral | 6 |

## Guia de Leitura por Público

### Para Usuários Finais

1. **Início Rápido**
   - `docs/KEYBOARD_SHORTCUTS.md` → Seções "Como Usar" e "Atalhos Globais"

2. **Descobrir Atalhos**
   - Pressione `?` em qualquer página
   - `docs/KEYBOARD_SHORTCUTS.md` → "Atalhos por Página"

3. **Dicas de Uso**
   - `docs/KEYBOARD_SHORTCUTS.md` → "Navegação Rápida"

### Para Desenvolvedores

1. **Entender o Sistema**
   - `README.md` → "Instalação" e "Uso Básico"
   - `VISUAL_GUIDE.md` → "Arquitetura do Sistema"

2. **Implementar Atalhos**
   - `README.md` → "Uso Básico" (Exemplos 1-3)
   - `EXAMPLES.md` → Exemplos 1-10
   - `KEYBOARD_SHORTCUTS_TODO.md` → Templates

3. **API Reference**
   - `README.md` → "API Completa"
   - `types.ts` → Interfaces TypeScript

4. **Testes**
   - `TESTING.md` → Testes manuais e automatizados

### Para Arquitetos/Tech Leads

1. **Visão Geral**
   - `KEYBOARD_SHORTCUTS_SUMMARY.md` → Resumo completo

2. **Decisões de Design**
   - `VISUAL_GUIDE.md` → Fluxos e arquitetura
   - `README.md` → "Comportamento Inteligente"

3. **Planejamento**
   - `KEYBOARD_SHORTCUTS_TODO.md` → Roadmap de implementação

## Navegação por Tópico

### Instalação e Setup

- `README.md` → Seção "Instalação"
- `KEYBOARD_SHORTCUTS_SUMMARY.md` → "Estrutura de Arquivos"

### Uso Básico

- `README.md` → Seções 1-3 (Uso Básico)
- `EXAMPLES.md` → Exemplos 1-3

### Casos Avançados

- `EXAMPLES.md` → Exemplos 4-10
- `README.md` → "Exemplos Avançados"

### Modificadores de Teclas

- `README.md` → "Modificadores de Teclas"
- `docs/KEYBOARD_SHORTCUTS.md` → "Convenções de Teclas"

### Categorização

- `README.md` → "Categorias Sugeridas"
- `VISUAL_GUIDE.md` → "Categorização no Help Dialog"

### Cleanup e Lifecycle

- `VISUAL_GUIDE.md` → "Cleanup de Atalhos"
- `EXAMPLES.md` → Exemplo 2 (Formulário)

### Cross-Platform

- `README.md` → "Comportamento Inteligente"
- `TESTING.md` → "Cross-Platform Tests"

### Performance

- `KEYBOARD_SHORTCUTS_SUMMARY.md` → Seção "Performance"
- `TESTING.md` → "Performance Tests"

### Acessibilidade

- `README.md` → Notas de acessibilidade
- `TESTING.md` → "Acessibilidade Tests"

### Troubleshooting

- `README.md` → "Troubleshooting"
- `docs/KEYBOARD_SHORTCUTS.md` → "Troubleshooting"

### Testing

- `TESTING.md` → Guia completo de testes
- `README.md` → Notas sobre testes

### Implementações Futuras

- `KEYBOARD_SHORTCUTS_TODO.md` → Páginas pendentes
- `docs/KEYBOARD_SHORTCUTS.md` → "Atalhos Planejados"

## Fluxo de Aprendizado Recomendado

### Dia 1: Fundamentos
1. Ler `KEYBOARD_SHORTCUTS_SUMMARY.md` (15 min)
2. Ler `README.md` até "Uso Básico" (20 min)
3. Testar na aplicação pressionando `?` (5 min)

### Dia 2: Implementação
1. Ler `EXAMPLES.md` exemplos 1-3 (15 min)
2. Implementar primeiro atalho em uma página (30 min)
3. Testar e verificar no help dialog (5 min)

### Dia 3: Avançado
1. Ler `EXAMPLES.md` exemplos 4-7 (20 min)
2. Implementar atalhos condicionais (20 min)
3. Ler `VISUAL_GUIDE.md` (15 min)

### Dia 4: Testes e Refinamento
1. Ler `TESTING.md` (30 min)
2. Executar testes manuais (20 min)
3. Documentar atalhos criados (10 min)

## Referência Rápida

### Imports Comuns

```typescript
// Hook básico
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

// Auto-registro
import { useAutoRegisterShortcuts } from '@/hooks/useKeyboardShortcuts';

// Helper de navegação
import { useNavigationShortcuts } from '@/hooks/useKeyboardShortcuts';

// Provider (no layout)
import { KeyboardShortcutsProvider } from '@/components/keyboard-shortcuts';
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts';

// Tipos
import type {
  KeyboardShortcut,
  ShortcutOptions
} from '@/components/keyboard-shortcuts/types';
```

### Snippets

#### Atalho Simples
```typescript
useAutoRegisterShortcuts([
  {
    key: 'n',
    callback: () => router.push('/new'),
    options: { description: 'Novo', category: 'Ações' },
  },
], [router]);
```

#### Atalho com Modificador
```typescript
{
  key: 's',
  callback: handleSave,
  options: {
    description: 'Salvar',
    category: 'Ações',
    ctrl: true,
  },
}
```

#### Atalho Condicional
```typescript
useEffect(() => {
  if (!canEdit) return;
  const unregister = registerShortcut('e', handleEdit, {...});
  return unregister;
}, [canEdit]);
```

## Estatísticas da Documentação

- **Total de Arquivos**: 11
- **Linhas de Código**: ~1500
- **Páginas de Documentação**: ~40
- **Exemplos de Código**: 30+
- **Testes Sugeridos**: 40+
- **Fluxogramas**: 8

## Contribuindo com a Documentação

### Adicionar Novo Exemplo

1. Editar `EXAMPLES.md`
2. Seguir formato existente
3. Incluir código completo
4. Adicionar ao índice

### Reportar Erro na Documentação

1. Abrir issue no GitHub
2. Referenciar arquivo e seção
3. Sugerir correção

### Sugerir Melhoria

1. Editar arquivo relevante
2. Fazer PR com mudanças
3. Atualizar este índice se necessário

## Convenções da Documentação

### Formato de Código

- TypeScript para todos os exemplos
- Imports explícitos
- Comentários em português
- Tipos sempre presentes

### Estrutura de Exemplos

1. Descrição do cenário
2. Código completo
3. Notas importantes
4. Resultado esperado

### Terminologia

- **Atalho** = Keyboard Shortcut
- **Modificador** = Ctrl, Alt, Shift
- **Callback** = Função executada
- **Cleanup** = Remoção de atalho
- **Provider** = Context Provider

## Versionamento

- **v1.0.0** (2026-03-19) - Versão inicial completa
  - Core system implementado
  - Documentação completa
  - Exemplos práticos
  - Guias de teste

## Próximas Versões

- **v1.1.0** - Atalhos em todas as páginas principais
- **v1.2.0** - Navegação em listas (j/k)
- **v2.0.0** - Command Palette integration

## Recursos Externos

### React & TypeScript
- [React Hooks](https://react.dev/reference/react)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Context API](https://react.dev/reference/react/useContext)

### Testing
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest](https://jestjs.io/docs/getting-started)
- [Cypress](https://docs.cypress.io/)

### Acessibilidade
- [ARIA Best Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Keyboard Interactions](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)

## Suporte

### Onde Buscar Ajuda

1. **Documentação** - Começar por aqui
2. **Exemplos** - Ver código funcionando
3. **Issues** - Reportar problemas
4. **Code Review** - Pedir feedback

### FAQ Comum

Veja `README.md` → "Troubleshooting"

---

**Última atualização**: 2026-03-19

Este índice é mantido manualmente. Ao adicionar novos arquivos, atualize este documento.
