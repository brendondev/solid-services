# Solid Service - Design System

## 🎨 Design Reference

Baseado no design moderno e clean apresentado pelo cliente.

## Princípios de Design

### 1. Layout
- **Sidebar fixa** à esquerda com navegação principal
- **Conteúdo principal** com fundo claro/neutro
- **Cards** com sombras suaves para separação visual
- **Espaçamento generoso** entre elementos
- **Grid responsivo** para diferentes tamanhos de tela

### 2. Cores

#### Light Theme (Padrão)
```css
--background: #FAFAFA (cinza muito claro)
--surface: #FFFFFF (branco)
--primary: #4A90E2 (azul suave)
--primary-dark: #357ABD
--text-primary: #2C3E50 (cinza escuro)
--text-secondary: #6B7280 (cinza médio)
--border: #E5E7EB (cinza claro)
--success: #10B981 (verde)
--warning: #F59E0B (laranja)
--error: #EF4444 (vermelho)
--info: #3B82F6 (azul)
```

#### Dark Theme
```css
--background: #1A202C (cinza escuro)
--surface: #2D3748 (cinza médio-escuro)
--primary: #4A90E2 (azul suave - mesmo)
--primary-dark: #357ABD
--text-primary: #F7FAFC (branco suave)
--text-secondary: #A0AEC0 (cinza claro)
--border: #4A5568 (cinza médio)
--success: #10B981
--warning: #F59E0B
--error: #EF4444
--info: #3B82F6
```

### 3. Typography

```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

/* Headings */
--text-4xl: 36px / 40px (Títulos principais)
--text-3xl: 30px / 36px
--text-2xl: 24px / 32px
--text-xl: 20px / 28px
--text-lg: 18px / 28px

/* Body */
--text-base: 16px / 24px
--text-sm: 14px / 20px
--text-xs: 12px / 16px

/* Weights */
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### 4. Componentes

#### Cards
- Background: `var(--surface)`
- Border radius: `12px`
- Shadow: `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`
- Padding: `24px` (p-6)
- Hover: leve elevação da sombra

#### Sidebar
- Width: `280px`
- Background: `var(--surface)`
- Border right: `1px solid var(--border)`
- Items: hover com `background: var(--background)`
- Active: `background: var(--primary)` com `color: white`
- Icons: `20px` com spacing de `12px`

#### Buttons

**Primary**
- Background: `var(--primary)`
- Color: `white`
- Padding: `12px 24px`
- Border radius: `8px`
- Hover: `var(--primary-dark)`
- Shadow: `0 1px 2px rgba(0,0,0,0.05)`

**Secondary**
- Background: `transparent`
- Border: `1px solid var(--border)`
- Color: `var(--text-primary)`
- Hover: `background: var(--background)`

**Ghost**
- Background: `transparent`
- Color: `var(--text-secondary)`
- Hover: `background: var(--background)`

#### Inputs
- Border: `1px solid var(--border)`
- Border radius: `8px`
- Padding: `10px 12px`
- Focus: `border-color: var(--primary)` + `ring: 2px var(--primary) 0.2 opacity`
- Background: `var(--surface)`

#### Tables
- Header: `background: var(--background)`, `text: var(--text-secondary)`, `font-weight: 600`
- Rows: `border-bottom: 1px solid var(--border)`
- Hover: `background: var(--background)`
- Padding cells: `16px` (px-4 py-3)

### 5. Gráficos

- **Cores primárias**: Azul (`#4A90E2`), Rosa/Roxo (`#9F7AEA`)
- **Grid lines**: cinza claro, sutil
- **Tooltips**: fundo branco com sombra
- **Smooth curves**: usar curvas suaves nos gráficos de linha

### 6. Ícones

- **Tamanho padrão**: 20px
- **Estilo**: Outline/Stroke (não filled)
- **Stroke width**: 2px
- **Biblioteca sugerida**: Heroicons, Lucide, ou Phosphor

### 7. Espaçamento

```css
--spacing-1: 4px
--spacing-2: 8px
--spacing-3: 12px
--spacing-4: 16px
--spacing-5: 20px
--spacing-6: 24px
--spacing-8: 32px
--spacing-10: 40px
--spacing-12: 48px
--spacing-16: 64px
```

### 8. Sombras

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
```

## Componentes Específicos

### Dashboard Cards (Métricas)

```tsx
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400">Label</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        R$ 54.253,64
      </p>
    </div>
    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
    </div>
  </div>
</div>
```

### Highlighted Card (Em caixa)

```tsx
<div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
  <p className="text-sm opacity-90">Em caixa</p>
  <p className="text-3xl font-bold">R$ 12.423</p>
</div>
```

### Chart Container

```tsx
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
  <div className="flex items-center justify-between mb-6">
    <h3 className="text-lg font-semibold">Evolução da Receita</h3>
    <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
      <option>Fevereiro - 2025</option>
    </select>
  </div>
  {/* Chart aqui */}
</div>
```

## Dark Mode Toggle

### Implementação

```tsx
// Hook para dark mode
const [isDark, setIsDark] = useState(false);

useEffect(() => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [isDark]);

// Toggle button
<button
  onClick={() => setIsDark(!isDark)}
  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
>
  {isDark ? '🌞' : '🌙'}
</button>
```

## Animações

- **Transições**: `transition-all duration-200 ease-in-out`
- **Hover effects**: escala sutil `hover:scale-105` ou sombra
- **Loading states**: skeleton loaders com gradiente animado
- **Page transitions**: fade in suave

## Responsividade

### Breakpoints
- **sm**: 640px (mobile)
- **md**: 768px (tablet)
- **lg**: 1024px (desktop)
- **xl**: 1280px (large desktop)
- **2xl**: 1536px (extra large)

### Mobile
- Sidebar vira drawer/menu hamburguer
- Cards empilham verticalmente
- Tabelas com scroll horizontal
- Padding reduzido: `p-4` ao invés de `p-6`

## Acessibilidade

- Contraste mínimo: 4.5:1 para texto normal, 3:1 para texto grande
- Focus states visíveis: `focus:ring-2 focus:ring-primary`
- Labels em todos os inputs
- ARIA labels quando necessário
- Keyboard navigation

## Status Colors

```css
/* Status de Pedidos/Orçamentos */
--status-draft: #6B7280 (cinza)
--status-sent: #3B82F6 (azul)
--status-approved: #10B981 (verde)
--status-rejected: #EF4444 (vermelho)
--status-completed: #10B981 (verde)
--status-cancelled: #6B7280 (cinza)
--status-in-progress: #F59E0B (laranja)
```

## Next Steps

1. Instalar biblioteca de ícones (Lucide React)
2. Configurar Tailwind com as cores customizadas
3. Criar componentes UI reutilizáveis
4. Implementar dark mode
5. Adicionar gráficos (Recharts ou Chart.js)
6. Melhorar sidebar com animações

---

**Referência visual**: Design limpo, moderno, profissional
**Inspiração**: Produtos SaaS modernos (Notion, Linear, Stripe Dashboard)
