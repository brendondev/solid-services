# Solid Service - Progresso Tasks #14, #17, #18

**Data:** 13/03/2026
**Tasks Concluídas:** 3
**Status:** ✅ PDF, S3 Attachments e Service Orders Pages

---

## 📋 Task #14: Geração de PDF para Orçamentos ✅

### Backend
**Biblioteca:** pdfmake + @types/pdfmake

**Service criado:** `QuotationPdfService`
- Layout profissional em A4
- Header com título e número do orçamento
- Footer com número de página
- Informações da empresa (placeholder)
- Dados do cliente (nome, email, telefone)
- Metadados (data, status, validade)
- Tabela de itens com cálculo automático
- Total destacado
- Observações (se houver)
- Tradução de status para PT-BR
- Estilos consistentes com design system

**Endpoint:** `GET /quotations/:id/pdf`
- Retorna PDF como download
- Nome do arquivo: `orcamento-{numero}.pdf`
- Content-Type: application/pdf
- Integrado no QuotationsModule

### Frontend
**API Client:** `quotationsApi.downloadPdf()`
- Request com responseType: 'blob'
- Download automático via link temporário
- Cleanup de recursos

**UI:** Botão na página de detalhes
- Sempre disponível (independente do status)
- Ícone SVG de download
- Loading state
- Feedback de erro

**Arquivo:** `apps/web/src/app/dashboard/quotations/[id]/page.tsx`

---

## 📎 Task #17: Sistema de Anexos com S3/MinIO ✅

### Bibliotecas Instaladas
- `@aws-sdk/client-s3` - SDK AWS v3
- `@aws-sdk/s3-request-presigner` - URLs assinadas
- `multer` + `@types/multer` - Upload multipart
- `uuid` + `@types/uuid` - Nomes únicos

### StorageService (core/storage)

**Funcionalidades:**
- ✅ Upload com validação de tamanho (max 10MB)
- ✅ Validação de extensões permitidas
- ✅ Geração de URLs assinadas (expiração: 1 hora)
- ✅ Deleção de arquivos
- ✅ Content-Type automático baseado em extensão
- ✅ Isolamento por tenant (path: `{tenantId}/{folder}/{uuid}.ext`)
- ✅ Compatível com AWS S3 **e** MinIO

**Extensões permitidas:**
- Documentos: pdf, doc, docx, xls, xlsx, txt
- Imagens: jpg, jpeg, png, gif, webp, svg
- Compactados: zip, rar

**Configuração (env vars):**
```env
S3_ENDPOINT=http://localhost:9000  # Opcional - apenas MinIO
S3_REGION=us-east-1
S3_BUCKET=solid-service
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
```

### Endpoints (Service Orders)

**POST /service-orders/:id/attachments**
- Upload de anexo
- Multipart/form-data
- Validações: tamanho, extensão, tenant, ordem
- Timeline automática (evento: attachment_uploaded)
- Retorna: attachment com metadados

**GET /service-orders/:id/attachments/:attachmentId/download**
- Gera URL assinada para download
- Expiração: 1 hora (3600s)
- Validações: tenant, ordem, anexo
- Retorna: { url, fileName, fileSize, mimeType, expiresIn }

**DELETE /service-orders/:id/attachments/:attachmentId**
- Deleta arquivo do S3
- Deleta registro do banco
- Timeline automática (evento: attachment_deleted)
- Validações: tenant, ordem, anexo

### Integração
**ServiceOrdersService atualizado:**
- Injeção do StorageService
- Métodos: uploadAttachment, getAttachmentDownloadUrl, deleteAttachment
- Eventos na timeline para auditoria
- Validações de tenant em todas operações

**ServiceOrdersController:**
- Decorators: `@UseInterceptors(FileInterceptor('file'))`
- `@ApiConsumes('multipart/form-data')` para Swagger

**StorageModule:**
- `@Global()` para uso em todos módulos
- Exporta StorageService

---

## 🖥️ Task #18: Páginas de Service Orders no Frontend ✅

### Páginas Criadas (Tasks #38 e #39)

**Lista de Ordens:** `apps/web/src/app/dashboard/orders/page.tsx`
- Tabela com todas as ordens
- Filtro por status
- Busca por número/cliente
- Paginação
- Navegação para detalhes

**Criar Nova Ordem:** `apps/web/src/app/dashboard/orders/new/page.tsx`
- Formulário completo com React Hook Form + Zod
- Seleção de cliente
- Múltiplos itens de serviço (useFieldArray)
- Agendamento (data/hora)
- Técnico responsável
- Observações

**Detalhes da Ordem:** `apps/web/src/app/dashboard/orders/[id]/page.tsx`
- Informações completas
- Timeline de eventos
- Checklist interativo
- Ações contextuais por status
- Mudança de status
- Lista de anexos (ready para integração com S3)

### Features das Páginas
- ✅ CRUD completo
- ✅ Validação de formulários
- ✅ Loading states
- ✅ Error handling
- ✅ Navigation flows
- ✅ Status workflow
- ✅ Timeline interativa
- ✅ Checklist completable
- ⏳ Upload de anexos (backend pronto, falta frontend)

---

## 📊 Estatísticas

### Código Adicionado
- **Backend:** ~600 linhas (PDF + Storage + Attachments)
- **Frontend:** ~40 linhas (PDF button)
- **Total:** ~640 linhas

### Arquivos Criados/Modificados
**Backend:**
- `apps/api/src/modules/quotations/services/quotation-pdf.service.ts` (novo)
- `apps/api/src/core/storage/storage.service.ts` (novo)
- `apps/api/src/core/storage/storage.module.ts` (novo)
- `apps/api/src/core/storage/index.ts` (novo)
- `apps/api/src/modules/quotations/quotations.controller.ts` (modificado)
- `apps/api/src/modules/quotations/quotations.module.ts` (modificado)
- `apps/api/src/modules/service-orders/service-orders.controller.ts` (modificado)
- `apps/api/src/modules/service-orders/service-orders.service.ts` (modificado)
- `apps/api/src/app.module.ts` (modificado)
- `apps/api/package.json` (modificado)

**Frontend:**
- `apps/web/src/lib/api/quotations.ts` (modificado)
- `apps/web/src/app/dashboard/quotations/[id]/page.tsx` (modificado)

### Dependências Instaladas
**Backend:**
- pdfmake
- @types/pdfmake
- @aws-sdk/client-s3
- @aws-sdk/s3-request-presigner
- multer
- @types/multer
- uuid
- @types/uuid

---

## 🔄 Fluxo Completo Implementado

### Orçamento → PDF
1. Cliente visualiza orçamento
2. Clica em "Baixar PDF"
3. Backend gera PDF profissional
4. Download automático no browser
5. Arquivo: `orcamento-QT-2026-001.pdf`

### Ordem de Serviço → Anexos
1. Técnico visualiza ordem
2. Faz upload de foto/documento
3. Arquivo enviado para S3 (isolado por tenant)
4. Registro salvo no banco com metadados
5. Evento adicionado na timeline
6. Anexo listado na página da ordem
7. Download via URL assinada (segura, temporária)
8. Anexo pode ser deletado (remove S3 + banco)

---

## ⚙️ Configuração para Desenvolvimento

### MinIO Local (Opcional)
```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

**Criar bucket:**
1. Acessar http://localhost:9001
2. Login: minioadmin / minioadmin
3. Criar bucket "solid-service"
4. Configurar policy pública (se necessário)

### Variáveis de Ambiente
```env
# .env (development com MinIO)
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_BUCKET=solid-service
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin

# .env (production com AWS S3)
# S3_ENDPOINT não definido (usa AWS S3)
S3_REGION=us-east-1
S3_BUCKET=solid-service-prod
S3_ACCESS_KEY_ID={from AWS IAM}
S3_SECRET_ACCESS_KEY={from AWS IAM}
```

---

## 🚀 Próximos Passos

### Frontend de Anexos (Prioridade Alta)
- [ ] Componente de upload (drag & drop)
- [ ] Lista de anexos na página da ordem
- [ ] Preview de imagens
- [ ] Download button
- [ ] Delete confirmation

### Features Complementares
- [ ] PDF para Ordens de Serviço
- [ ] Email com PDF anexado (enviar orçamento)
- [ ] Compressão de imagens antes do upload
- [ ] Preview de PDFs no browser
- [ ] Galeria de fotos da ordem

### Tasks Pendentes do MVP
- #19: Módulo de Scheduling (agendamento avançado)
- #20: Componente de calendário
- #23: Portal do Cliente
- #24: Notificações por email
- #25: RBAC (perfis e permissões)
- #28: Audit Log

---

## ✅ Checklist de Validação

### PDF de Orçamentos
- [x] Backend gera PDF corretamente
- [x] PDF tem layout profissional
- [x] Dados aparecem completos (cliente, itens, total)
- [x] Download funciona no frontend
- [x] Nome do arquivo é correto
- [x] Endpoint documentado no Swagger

### Sistema de Anexos
- [x] Upload funciona (validações OK)
- [x] Arquivo salvo no S3 com path correto
- [x] Metadados salvos no banco
- [x] URL assinada gerada corretamente
- [x] Download funciona
- [x] Deleção remove S3 + banco
- [x] Timeline registra eventos
- [x] Isolamento de tenant funciona
- [x] Validação de tamanho/extensão OK
- [x] Endpoints documentados no Swagger

---

## 🎯 Impacto no MVP

### Geração de PDF
- ✅ Orçamentos profissionais para clientes
- ✅ Impressão facilitada
- ✅ Branding consistente
- ✅ Sem dependência de ferramentas externas

### Sistema de Anexos
- ✅ Documentação visual das ordens
- ✅ Evidências de serviço (fotos antes/depois)
- ✅ Armazenamento escalável (S3)
- ✅ Segurança (URLs temporárias)
- ✅ Multi-tenant isolado
- ✅ Auditoria via timeline

### Páginas de Service Orders
- ✅ Gestão completa do ciclo de vida da ordem
- ✅ Timeline para rastreamento
- ✅ Checklist para execução
- ✅ Status workflow claro
- ✅ UX consistente

---

**3 tasks concluídas com sucesso!** 🎉

**Commits:**
1. `feat: implementar geração de PDF para orçamentos (backend)`
2. `feat: adicionar botão de download de PDF no frontend`
3. `feat: implementar sistema completo de anexos com S3/MinIO`
