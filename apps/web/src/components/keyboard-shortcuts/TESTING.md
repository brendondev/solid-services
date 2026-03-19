# Testing Guide - Keyboard Shortcuts

Guia completo de testes para o sistema de atalhos de teclado.

## Testes Manuais

### 1. Registro e Exibição de Atalhos

#### Test Case 1.1: Atalho Aparece no Help Dialog
```
Passos:
1. Navegar para /dashboard/customers
2. Pressionar '?'
3. Verificar que aparecem os atalhos:
   - 'n' - Criar novo cliente
   - '/' - Focar na busca
   - 'Ctrl+F' - Abrir filtros avançados

Resultado esperado:
✓ Dialog abre
✓ Atalhos aparecem agrupados por categoria
✓ Teclas mostradas em badges
```

#### Test Case 1.2: Atalhos São Categorizados
```
Passos:
1. Pressionar '?'
2. Verificar categorias:
   - NAVEGAÇÃO
   - AÇÕES
   - SISTEMA

Resultado esperado:
✓ Categorias aparecem em ordem de prioridade
✓ Atalhos agrupados corretamente
```

### 2. Execução de Atalhos

#### Test Case 2.1: Atalho 'n' Cria Novo Cliente
```
Passos:
1. Navegar para /dashboard/customers
2. Pressionar 'n'

Resultado esperado:
✓ Navega para /dashboard/customers/new
```

#### Test Case 2.2: Atalho '/' Foca na Busca
```
Passos:
1. Navegar para /dashboard/customers
2. Pressionar '/'

Resultado esperado:
✓ Input de busca recebe foco
✓ Cursor pisca dentro do input
```

#### Test Case 2.3: Atalho Ctrl+F Abre Filtros
```
Passos:
1. Navegar para /dashboard/customers
2. Pressionar Ctrl+F (ou Cmd+F no Mac)

Resultado esperado:
✓ Drawer de filtros abre
✓ Comportamento padrão do navegador é prevenido
```

#### Test Case 2.4: Atalho Ctrl+S Salva Formulário
```
Passos:
1. Navegar para /dashboard/customers/new
2. Preencher nome do cliente
3. Pressionar Ctrl+S

Resultado esperado:
✓ Formulário é submetido
✓ Cliente é criado
✓ Navega para página de detalhes
✓ Dialog de "Salvar página" do navegador NÃO abre
```

#### Test Case 2.5: Atalho Esc Cancela e Volta
```
Passos:
1. Navegar para /dashboard/customers/new
2. Pressionar Esc

Resultado esperado:
✓ Volta para /dashboard/customers
✓ Formulário não é salvo
```

### 3. Detecção de Input

#### Test Case 3.1: Atalho NÃO Funciona em Input de Texto
```
Passos:
1. Navegar para /dashboard/customers
2. Clicar no input de busca
3. Pressionar 'n'

Resultado esperado:
✓ Letra 'n' é digitada no input
✓ Atalho NÃO é acionado
✓ NÃO navega para /new
```

#### Test Case 3.2: Atalho NÃO Funciona em Textarea
```
Passos:
1. Abrir formulário com textarea
2. Clicar no textarea
3. Pressionar 'n'

Resultado esperado:
✓ Letra 'n' é digitada no textarea
✓ Atalho NÃO é acionado
```

#### Test Case 3.3: Atalho NÃO Funciona em Select
```
Passos:
1. Abrir formulário com select
2. Clicar no select
3. Pressionar tecla

Resultado esperado:
✓ Select responde normalmente
✓ Atalho NÃO é acionado
```

#### Test Case 3.4: Atalho Funciona Fora de Inputs
```
Passos:
1. Navegar para /dashboard/customers
2. Clicar em área vazia da página
3. Pressionar 'n'

Resultado esperado:
✓ Atalho é acionado
✓ Navega para /new
```

### 4. Cleanup de Atalhos

#### Test Case 4.1: Atalhos São Removidos ao Navegar
```
Passos:
1. Navegar para /dashboard/customers
2. Pressionar '?' e verificar atalhos
3. Navegar para /dashboard/orders
4. Pressionar '?' novamente

Resultado esperado:
✓ Atalhos de customers NÃO aparecem mais
✓ Apenas atalhos globais e de orders aparecem
```

#### Test Case 4.2: Atalho Antigo Não Responde
```
Passos:
1. Navegar para /dashboard/customers
2. Navegar para /dashboard/services
3. Pressionar 'n'

Resultado esperado:
✓ Cria novo SERVICE (não customer)
✓ Atalho antigo foi removido corretamente
```

### 5. Modificadores de Teclas

#### Test Case 5.1: Ctrl vs Sem Ctrl
```
Passos:
1. Navegar para /dashboard/customers
2. Pressionar 'f' (sem Ctrl)
3. Verificar comportamento
4. Pressionar Ctrl+F
5. Verificar comportamento

Resultado esperado:
✓ 'f' sem Ctrl não faz nada
✓ Ctrl+F abre filtros
```

#### Test Case 5.2: Shift+Tecla
```
Passos:
1. Abrir página que usa Shift+D
2. Pressionar 'd' (sem Shift)
3. Pressionar Shift+D

Resultado esperado:
✓ 'd' sem Shift não executa ação
✓ Shift+D executa ação
```

### 6. Cross-Platform

#### Test Case 6.1: Windows/Linux - Ctrl
```
Passos:
1. Abrir no Windows/Linux
2. Pressionar Ctrl+S
3. Pressionar '?'

Resultado esperado:
✓ Atalho funciona com Ctrl
✓ Help mostra "Ctrl + S"
```

#### Test Case 6.2: macOS - Cmd
```
Passos:
1. Abrir no macOS
2. Pressionar Cmd+S
3. Pressionar '?'

Resultado esperado:
✓ Atalho funciona com Cmd
✓ Help mostra "Cmd + S"
```

### 7. Conflitos e Validação

#### Test Case 7.1: Console Warning para Duplicados
```
Passos:
1. Abrir console do navegador
2. Registrar dois atalhos com mesma tecla
3. Verificar console

Resultado esperado:
✓ Console mostra warning sobre conflito
✓ Último atalho registrado prevalece
```

#### Test Case 7.2: Validação Antes de Executar
```
Passos:
1. Navegar para lista sem item selecionado
2. Pressionar 'e' (editar)

Resultado esperado:
✓ Toast de aviso aparece
✓ Ação não é executada
```

### 8. Acessibilidade

#### Test Case 8.1: Dialog é Acessível
```
Passos:
1. Pressionar '?'
2. Navegar com Tab
3. Usar screen reader

Resultado esperado:
✓ Dialog tem ARIA labels
✓ Navegação por Tab funciona
✓ Screen reader lê conteúdo corretamente
```

#### Test Case 8.2: Esc Fecha Dialog
```
Passos:
1. Pressionar '?'
2. Pressionar Esc

Resultado esperado:
✓ Dialog fecha
✓ Foco retorna ao elemento anterior
```

### 9. Performance

#### Test Case 9.1: Sem Lag ao Pressionar Teclas
```
Passos:
1. Navegar para qualquer página
2. Pressionar várias teclas rapidamente

Resultado esperado:
✓ Resposta instantânea
✓ Sem lag ou delay perceptível
```

#### Test Case 9.2: Sem Memory Leaks
```
Passos:
1. Navegar entre várias páginas
2. Abrir DevTools > Memory
3. Fazer memory snapshot
4. Navegar mais
5. Fazer outro snapshot

Resultado esperado:
✓ Memória não aumenta indefinidamente
✓ Atalhos antigos são garbage collected
```

## Testes Automatizados (Sugeridos)

### Unit Tests

```typescript
// KeyboardShortcutsProvider.test.tsx

describe('KeyboardShortcutsProvider', () => {
  it('registra atalho corretamente', () => {
    const { result } = renderHook(() => useKeyboardShortcutsContext(), {
      wrapper: KeyboardShortcutsProvider,
    });

    const callback = jest.fn();
    const unregister = result.current.registerShortcut('n', callback, {
      description: 'Test',
    });

    expect(result.current.shortcuts).toHaveLength(1);
    expect(result.current.shortcuts[0].key).toBe('n');

    unregister();
    expect(result.current.shortcuts).toHaveLength(0);
  });

  it('detecta conflitos de atalhos', () => {
    const consoleSpy = jest.spyOn(console, 'warn');
    const { result } = renderHook(() => useKeyboardShortcutsContext(), {
      wrapper: KeyboardShortcutsProvider,
    });

    result.current.registerShortcut('n', jest.fn(), { description: 'First' });
    result.current.registerShortcut('n', jest.fn(), { description: 'Second' });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Atalho duplicado')
    );
  });

  it('não dispara em inputs', () => {
    const { container } = render(
      <KeyboardShortcutsProvider>
        <input type="text" />
      </KeyboardShortcutsProvider>
    );

    const input = container.querySelector('input');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'n' });

    // Atalho não deve ser acionado
  });
});
```

### Integration Tests

```typescript
// customers-page.test.tsx

describe('Customers Page Shortcuts', () => {
  it('atalho "n" navega para new customer', async () => {
    const router = { push: jest.fn() };
    render(<CustomersPage />, { router });

    fireEvent.keyDown(document, { key: 'n' });

    expect(router.push).toHaveBeenCalledWith('/dashboard/customers/new');
  });

  it('atalho "/" foca no input de busca', () => {
    const { getByPlaceholderText } = render(<CustomersPage />);
    const searchInput = getByPlaceholderText('Buscar clientes...');

    fireEvent.keyDown(document, { key: '/' });

    expect(document.activeElement).toBe(searchInput);
  });

  it('atalho "Ctrl+F" abre filtros', () => {
    const { getByText } = render(<CustomersPage />);

    fireEvent.keyDown(document, { key: 'f', ctrlKey: true });

    expect(getByText('Filtros Avançados')).toBeInTheDocument();
  });
});
```

### E2E Tests (Cypress/Playwright)

```typescript
// keyboard-shortcuts.spec.ts

describe('Keyboard Shortcuts E2E', () => {
  it('help dialog mostra atalhos', () => {
    cy.visit('/dashboard/customers');
    cy.get('body').type('?');
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('Atalhos de Teclado').should('be.visible');
    cy.contains('Criar novo cliente').should('be.visible');
  });

  it('atalho "n" cria novo cliente', () => {
    cy.visit('/dashboard/customers');
    cy.get('body').type('n');
    cy.url().should('include', '/customers/new');
  });

  it('atalho não funciona em input', () => {
    cy.visit('/dashboard/customers');
    cy.get('input[placeholder*="Buscar"]').click().type('n');
    cy.url().should('not.include', '/new');
  });

  it('atalhos são removidos ao navegar', () => {
    cy.visit('/dashboard/customers');
    cy.get('body').type('?');
    cy.contains('Criar novo cliente').should('be.visible');
    cy.get('[role="dialog"]').type('{esc}');

    cy.visit('/dashboard/services');
    cy.get('body').type('?');
    cy.contains('Criar novo cliente').should('not.exist');
  });
});
```

## Checklist de Testes

### Funcionalidade Básica
- [ ] Atalhos aparecem no help dialog
- [ ] Atalhos são executados quando tecla é pressionada
- [ ] Atalhos são categorizados corretamente
- [ ] Help dialog abre com '?'
- [ ] Help dialog fecha com 'Esc'

### Detecção de Input
- [ ] Atalhos NÃO funcionam em `<input>`
- [ ] Atalhos NÃO funcionam em `<textarea>`
- [ ] Atalhos NÃO funcionam em `<select>`
- [ ] Atalhos NÃO funcionam em `contenteditable`
- [ ] Atalhos funcionam fora de inputs

### Modificadores
- [ ] Ctrl+Tecla funciona
- [ ] Cmd+Tecla funciona no Mac
- [ ] Alt+Tecla funciona
- [ ] Shift+Tecla funciona
- [ ] Combinações múltiplas funcionam

### Cleanup
- [ ] Atalhos são removidos ao desmontar componente
- [ ] Atalhos antigos não respondem após navegação
- [ ] Sem memory leaks após múltiplas navegações

### Cross-Platform
- [ ] Funciona no Windows
- [ ] Funciona no macOS
- [ ] Funciona no Linux
- [ ] Detecta Cmd vs Ctrl corretamente
- [ ] Exibe teclas corretas no help

### Performance
- [ ] Resposta instantânea
- [ ] Sem lag perceptível
- [ ] Bundle size aceitável
- [ ] Sem re-renders desnecessários

### Acessibilidade
- [ ] Dialog tem ARIA labels
- [ ] Navegação por Tab funciona
- [ ] Screen reader friendly
- [ ] Foco gerenciado corretamente

### Browser Compatibility
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Ferramentas Recomendadas

### Testing Libraries
- Jest - Unit tests
- React Testing Library - Component tests
- Cypress - E2E tests
- Playwright - E2E tests alternativo

### Debugging
- React DevTools - Verificar state
- Chrome DevTools - Memory profiling
- Console logs - Warnings de conflitos

### Automation
- GitHub Actions - CI/CD
- Pre-commit hooks - Rodar testes antes de commit

## Reportando Bugs

Ao encontrar um bug, incluir:

1. **Passos para reproduzir**
2. **Resultado esperado**
3. **Resultado atual**
4. **Browser e OS**
5. **Console logs**
6. **Screenshots/Videos** (se aplicável)

### Exemplo de Bug Report

```markdown
## Bug: Atalho 'n' não funciona em Firefox

**Passos:**
1. Abrir /dashboard/customers no Firefox 120
2. Pressionar 'n'

**Esperado:**
Navegar para /dashboard/customers/new

**Atual:**
Nada acontece

**Browser:** Firefox 120.0
**OS:** Windows 11
**Console:** (anexar logs)
```

## Melhorias Futuras

Sugestões de testes adicionais:

1. **Visual Regression Tests** - Screenshot comparison
2. **Performance Tests** - Lighthouse CI
3. **Load Tests** - Muitos atalhos registrados
4. **Security Tests** - XSS via callbacks
5. **i18n Tests** - Diferentes idiomas

---

Este guia garante que o sistema de atalhos funciona corretamente em todos os cenários.
