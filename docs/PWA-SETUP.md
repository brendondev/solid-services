# Progressive Web App (PWA) - Solid Service

## ✅ O que foi implementado

O Solid Service agora é um **Progressive Web App** completo, permitindo:

- 📱 **Instalação na tela inicial** (Android, iOS, Desktop)
- 🔌 **Modo offline** com cache inteligente
- ⚡ **Carregamento rápido** com service worker
- 🔔 **Notificações push** (preparado)
- 🎯 **Atalhos de app** para ações rápidas

## 📁 Arquivos Criados

```
apps/web/
├── public/
│   ├── manifest.json              # Configurações PWA
│   ├── service-worker.js          # Cache e offline
│   └── icons/                     # Ícones PWA (a adicionar)
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Meta tags PWA
│   │   └── offline/page.tsx       # Página offline
│   ├── components/pwa/
│   │   ├── pwa-wrapper.tsx        # Registro do SW
│   │   └── install-prompt.tsx     # Prompt de instalação
│   └── lib/
│       └── pwa.ts                 # Utilitários PWA
```

## 🎨 Ícones Necessários

**IMPORTANTE**: Você precisa adicionar os ícones em `apps/web/public/icons/`:

### Tamanhos requeridos:
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`

### Como gerar:

**Opção 1: PWA Builder (Recomendado)**
1. Acesse https://www.pwabuilder.com/imageGenerator
2. Faça upload de um logo 512x512 ou maior
3. Baixe o pacote de ícones
4. Extraia para `apps/web/public/icons/`

**Opção 2: ImageMagick**
```bash
cd apps/web/public/icons/

# A partir de um icon.png 512x512:
for size in 72 96 128 144 152 192 384 512; do
  convert icon.png -resize ${size}x${size} icon-${size}x${size}.png
done
```

**Opção 3: Online Tools**
- https://realfavicongenerator.net/
- https://favicon.io/favicon-converter/

## 🚀 Recursos Implementados

### 1. Service Worker
- **Cache**: Network-first com fallback para cache
- **Offline**: Páginas visitadas ficam disponíveis offline
- **Atualizações**: Verifica atualizações a cada 1 hora
- **Exclusões**: Requisições de API não são cacheadas

### 2. Manifest.json
- **Tema**: Azul (#3b82f6)
- **Display**: Standalone (app nativo)
- **Orientação**: Portrait (mobile)
- **Atalhos**:
  - Nova Ordem de Serviço
  - Novo Cliente
  - Visualizar Agenda

### 3. Página Offline
- Layout amigável quando sem conexão
- Botão para recarregar
- Link para página inicial
- Dicas sobre cache offline

### 4. Prompt de Instalação
- Aparece após 30 segundos de uso
- Pode ser recusado (não aparece novamente)
- Design responsivo e atraente
- Funciona em todos os dispositivos

### 5. Meta Tags
- iOS Safari: apple-mobile-web-app
- Android Chrome: mobile-web-app
- Viewport otimizado para mobile

## 📱 Como Instalar (Usuário Final)

### Android (Chrome)
1. Abrir o site no Chrome
2. Tocar em "⋮" (menu)
3. Selecionar "Adicionar à tela inicial"
4. Confirmar instalação

Ou aguardar o prompt automático após 30 segundos.

### iOS (Safari)
1. Abrir o site no Safari
2. Tocar no ícone "Compartilhar" (quadrado com seta)
3. Rolar e selecionar "Adicionar à Tela de Início"
4. Confirmar

### Desktop (Chrome/Edge)
1. Abrir o site no navegador
2. Clicar no ícone "+" na barra de endereço
3. Ou ir em Menu > Instalar Solid Service
4. Confirmar instalação

## 🧪 Como Testar

### 1. Localmente (Development)
```bash
cd apps/web
npm run build
npm start
```

O Service Worker **não** funciona em `npm run dev`, apenas em build de produção.

### 2. Chrome DevTools
1. Abrir DevTools (F12)
2. Ir em **Application**
3. Verificar:
   - ✅ Manifest
   - ✅ Service Workers
   - ✅ Cache Storage
   - ✅ Lighthouse PWA Score

### 3. Lighthouse Audit
```bash
npm install -g lighthouse

# Após build e npm start:
lighthouse http://localhost:3000 --view
```

**Meta**: Score PWA acima de 90/100

### 4. Teste Offline
1. Abrir o site
2. Navegar por algumas páginas
3. Abrir DevTools > Application > Service Workers
4. Marcar "Offline"
5. Recarregar página
6. Deve carregar do cache ou mostrar página offline

## 🔧 Configurações Avançadas

### Desabilitar PWA em Desenvolvimento
Editar `apps/web/src/components/pwa/pwa-wrapper.tsx`:
```typescript
if (process.env.NODE_ENV === 'production') {
  registerServiceWorker();
}
```

### Customizar Cores
Editar `apps/web/public/manifest.json`:
```json
{
  "theme_color": "#3b82f6",      // Cor da barra de status
  "background_color": "#ffffff"  // Cor de fundo no splash
}
```

### Adicionar Mais Atalhos
Editar `manifest.json`:
```json
{
  "shortcuts": [
    {
      "name": "Novo Orçamento",
      "url": "/dashboard/quotations/new",
      "icons": [...]
    }
  ]
}
```

### Notificações Push (Futuro)
O código já está preparado em `apps/web/src/lib/pwa.ts`:
```typescript
import { requestNotificationPermission, showNotification } from '@/lib/pwa';

// Pedir permissão
await requestNotificationPermission();

// Enviar notificação
await showNotification('Novo cliente cadastrado!', {
  body: 'João Silva foi adicionado com sucesso',
  icon: '/icons/icon-192x192.png',
});
```

## 📊 Checklist de Deploy

Antes de fazer deploy em produção:

- [ ] Adicionar todos os ícones em `public/icons/`
- [ ] Testar instalação no Android (Chrome)
- [ ] Testar instalação no iOS (Safari)
- [ ] Testar instalação no Desktop (Chrome)
- [ ] Verificar Lighthouse PWA score (>90)
- [ ] Testar modo offline
- [ ] Verificar manifest.json no DevTools
- [ ] Conferir Service Worker funcionando
- [ ] Testar atalhos de app
- [ ] Confirmar cores e tema

## 🐛 Troubleshooting

### Service Worker não registra
- Verificar se está em HTTPS (ou localhost)
- Verificar console do navegador
- Limpar cache e service workers antigos
- Rebuildar a aplicação

### Ícones não aparecem
- Verificar se os arquivos existem em `public/icons/`
- Conferir tamanhos corretos (72x72, 96x96, etc)
- Verificar formato PNG
- Inspecionar manifest.json no DevTools

### Prompt de instalação não aparece
- Já foi instalado antes
- Usuário já recusou (localStorage: pwa-install-declined)
- Não passou 30 segundos ainda
- Browser não suporta (Firefox mobile)

### Modo offline não funciona
- Service Worker não registrado
- Páginas não foram visitadas antes (cache vazio)
- API requests não são cacheadas (por design)
- Verificar Cache Storage no DevTools

## 🔗 Recursos Úteis

- [PWA Builder](https://www.pwabuilder.com/)
- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox (Service Worker library)](https://developers.google.com/web/tools/workbox)
- [Maskable.app (Test icons)](https://maskable.app/)

## 📈 Melhorias Futuras

- [ ] Background sync para forms offline
- [ ] Push notifications para novas ordens
- [ ] Precache de páginas principais
- [ ] Estratégias de cache por rota
- [ ] Update notifications mais sofisticadas
- [ ] App shortcuts dinâmicos
- [ ] Share Target API (compartilhar para o app)
- [ ] Periodic background sync

---

**Status**: ✅ PWA configurado e pronto para uso
**Próximo passo**: Adicionar ícones e testar em dispositivos reais
