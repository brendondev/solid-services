# Ícones PWA

Esta pasta contém os ícones necessários para o Progressive Web App (PWA).

## Tamanhos Necessários

- **72x72**: Android Chrome
- **96x96**: Android Chrome, Desktop Chrome
- **128x128**: Android Chrome
- **144x144**: Windows
- **152x152**: iOS Safari
- **192x192**: Android Chrome, PWA instalado
- **384x384**: Android Chrome
- **512x512**: Android Chrome, Splash screens

## Como Gerar os Ícones

### Opção 1: Usando uma ferramenta online

1. Acesse: https://www.pwabuilder.com/imageGenerator
2. Faça upload de um ícone 512x512 ou maior
3. Baixe o pacote de ícones gerados
4. Extraia os arquivos para esta pasta

### Opção 2: Usando ImageMagick (CLI)

```bash
# A partir de um ícone original de 512x512 (icon.png)

convert icon.png -resize 72x72 icon-72x72.png
convert icon.png -resize 96x96 icon-96x96.png
convert icon.png -resize 128x128 icon-128x128.png
convert icon.png -resize 144x144 icon-144x144.png
convert icon.png -resize 152x152 icon-152x152.png
convert icon.png -resize 192x192 icon-192x192.png
convert icon.png -resize 384x384 icon-384x384.png
convert icon.png -resize 512x512 icon-512x512.png
```

### Opção 3: Usando Node.js (sharp)

```bash
npm install sharp-cli -g

sharp -i icon.png -o icon-72x72.png resize 72 72
sharp -i icon.png -o icon-96x96.png resize 96 96
sharp -i icon.png -o icon-128x128.png resize 128 128
sharp -i icon.png -o icon-144x144.png resize 144 144
sharp -i icon.png -o icon-152x152.png resize 152 152
sharp -i icon.png -o icon-192x192.png resize 192 192
sharp -i icon.png -o icon-384x384.png resize 384 384
sharp -i icon.png -o icon-512x512.png resize 512 512
```

## Requisitos do Ícone Original

- **Formato**: PNG com fundo transparente ou sólido
- **Tamanho mínimo**: 512x512 pixels
- **Recomendado**: 1024x1024 pixels
- **Forma**: Quadrada (aspect ratio 1:1)
- **Design**: Simples, reconhecível em tamanhos pequenos
- **Cores**: Contraste alto para boa visibilidade

## Maskable Icons

Os ícones configurados no manifest.json são "maskable", o que significa que funcionam bem em dispositivos Android que aplicam máscaras ao ícone (círculos, squircles, etc).

**Área segura**: Mantenha o conteúdo principal do ícone dentro de 80% da área central para garantir que não seja cortado.

## Testando

Após adicionar os ícones, teste em:
- Chrome DevTools > Application > Manifest
- Lighthouse PWA audit
- Dispositivos reais (Android, iOS)
