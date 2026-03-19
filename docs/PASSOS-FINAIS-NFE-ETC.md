# Passos Finais - NFe e Funcionalidades Avançadas

> **Implementar APÓS sistema de Planos e Acessos estar completo**

---

## Contexto Multi-Tenant + NFe

### Desafio
Cada tenant (empresa) precisa emitir NF-e/NFS-e com seu próprio CNPJ e certificado digital. Não pode ser uma integração centralizada.

### Solução
Usar APIs de NFe que suportam **múltiplas empresas** (multi-company) com credenciais separadas por tenant.

---

## 1. Pesquisa de APIs de NFe (Código Aberto ou Multi-Company)

### Opções Recomendadas

#### 🥇 **Opção 1: Focus NFe** (API Paga - Melhor custo-benefício)
- **Site**: https://focusnfe.com.br
- **Modelo**: Pay-as-you-go (paga por nota emitida)
- **Multi-tenant**: ✅ Suporta múltiplas empresas
- **Features**:
  - NF-e, NFS-e, NFC-e, CT-e, MDF-e
  - Sandbox para testes
  - Webhook de retorno
  - Consulta de status
  - Cancelamento
  - Carta de Correção
- **Preço**: ~R$0,25/nota (NFS-e) | ~R$0,35/nota (NF-e)
- **API**: RESTful JSON
- **Como funciona**:
  - Cada tenant tem um `ref` (referência única)
  - Cadastra certificado A1/A3 por tenant
  - Emite notas passando o `ref` do tenant

#### 🥈 **Opção 2: eNotas** (API Paga)
- **Site**: https://enotas.com.br
- **Modelo**: Assinatura mensal + por nota
- **Multi-tenant**: ✅ Suporta múltiplas empresas
- **Features**: Similar ao Focus NFe
- **Preço**: A partir de R$59/mês + notas adicionais

#### 🥉 **Opção 3: NFe.io** (API Paga)
- **Site**: https://nfe.io
- **Modelo**: Pay-as-you-go
- **Multi-tenant**: ✅ Suporta múltiplas empresas
- **Features**: NF-e, NFS-e, NFC-e
- **Preço**: ~R$0,30/nota

#### 🔧 **Opção 4: PyNFe (Python Open Source)**
- **GitHub**: https://github.com/marcelospo/PyNFe
- **Modelo**: Self-hosted (gratuito)
- **Multi-tenant**: ⚠️ Requer customização
- **Features**: NF-e, NFS-e básico
- **Desvantagem**:
  - Requer infraestrutura própria
  - Manutenção complexa
  - Validações manuais
  - Sem suporte

#### 🔧 **Opção 5: PHP-NFe (PHP Open Source)**
- **GitHub**: https://github.com/nfephp-org/sped-nfe
- **Modelo**: Self-hosted (gratuito)
- **Multi-tenant**: ⚠️ Requer customização
- **Features**: NF-e completo
- **Desvantagem**: Similar ao PyNFe

### **Recomendação Final**: Focus NFe
- Melhor custo-benefício
- Multi-tenant nativo
- API moderna (RESTful)
- Sandbox para testes
- Documentação completa
- Sem custos fixos (pay-as-you-go)
- Suporte técnico

---

## 2. Arquitetura da Solução

### 2.1 Modelo de Dados (Prisma)

```prisma
// Configuração de NFe por Tenant
model NFeConfig {
  id                  String   @id @default(uuid())
  tenantId            String   @unique @map("tenant_id")

  // Dados da Empresa
  cnpj                String
  razaoSocial         String   @map("razao_social")
  nomeFantasia        String?  @map("nome_fantasia")
  inscricaoEstadual   String?  @map("inscricao_estadual")
  inscricaoMunicipal  String?  @map("inscricao_municipal")
  regimeTributario    String   @map("regime_tributario") // 1=Simples, 2=Normal, 3=MEI

  // Endereço
  logradouro          String
  numero              String
  complemento         String?
  bairro              String
  municipio           String
  uf                  String
  cep                 String

  // Certificado Digital (A1)
  certificadoBase64   String?  @map("certificado_base64") // Criptografado
  certificadoSenha    String?  @map("certificado_senha")   // Criptografado
  certificadoValidoAte DateTime? @map("certificado_valido_ate")

  // API Externa (Focus NFe)
  apiProvider         String   @default("focusnfe") @map("api_provider")
  apiToken            String?  @map("api_token") // Criptografado
  apiRef              String?  @map("api_ref")    // Referência no Focus NFe
  apiEnvironment      String   @default("homologacao") @map("api_environment") // homologacao ou producao

  // Configurações
  proximoNumeroNFe    Int      @default(1) @map("proximo_numero_nfe")
  proximoNumeroNFSe   Int      @default(1) @map("proximo_numero_nfse")
  serie               String   @default("1")

  isActive            Boolean  @default(false) @map("is_active")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  notas  NotaFiscal[]

  @@index([tenantId])
  @@map("nfe_configs")
}

// Notas Fiscais Emitidas
model NotaFiscal {
  id              String   @id @default(uuid())
  tenantId        String   @map("tenant_id")
  nfeConfigId     String   @map("nfe_config_id")

  // Relações
  customerId      String?  @map("customer_id")
  serviceOrderId  String?  @unique @map("service_order_id")
  receivableId    String?  @map("receivable_id")

  // Dados da Nota
  tipo            String   // "nfe", "nfse", "nfce"
  numero          String
  serie           String
  chaveAcesso     String?  @map("chave_acesso") // 44 dígitos
  protocolo       String?
  dataEmissao     DateTime @map("data_emissao")

  // Valores
  valorTotal      Decimal  @map("valor_total") @db.Decimal(10, 2)
  valorServicos   Decimal  @default(0) @map("valor_servicos") @db.Decimal(10, 2)
  valorProdutos   Decimal  @default(0) @map("valor_produtos") @db.Decimal(10, 2)
  valorIss        Decimal  @default(0) @map("valor_iss") @db.Decimal(10, 2)

  // Status
  status          String   @default("processando") // processando, autorizada, cancelada, rejeitada, erro
  motivoStatus    String?  @map("motivo_status")

  // XML e PDF
  xmlUrl          String?  @map("xml_url")
  pdfUrl          String?  @map("pdf_url")

  // Metadata
  apiResponse     Json?    @map("api_response") // Resposta completa da API

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  canceladaEm     DateTime? @map("cancelada_em")

  nfeConfig    NFeConfig     @relation(fields: [nfeConfigId], references: [id])
  customer     Customer?     @relation(fields: [customerId], references: [id])
  serviceOrder ServiceOrder? @relation(fields: [serviceOrderId], references: [id])

  @@unique([tenantId, numero, serie])
  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, dataEmissao])
  @@index([chaveAcesso])
  @@map("notas_fiscais")
}
```

### 2.2 Backend - NFeModule

```typescript
// apps/api/src/modules/nfe/nfe.module.ts
@Module({
  imports: [PrismaModule, SubscriptionsModule],
  controllers: [NFeController, NFeConfigController],
  providers: [NFeService, FocusNFeService, EncryptionService],
})
export class NFeModule {}
```

#### Service: FocusNFeService

```typescript
@Injectable()
export class FocusNFeService {
  private baseUrl: string;

  constructor(private config: ConfigService) {
    this.baseUrl = 'https://api.focusnfe.com.br/v2';
  }

  async emitirNFSe(nfeConfig: NFeConfig, data: EmitirNFSeDto): Promise<any> {
    const { apiToken, apiRef } = nfeConfig;

    const payload = {
      data_emissao: data.dataEmissao,
      prestador: {
        cnpj: nfeConfig.cnpj,
        inscricao_municipal: nfeConfig.inscricaoMunicipal,
      },
      tomador: {
        cnpj: data.tomador.cnpj,
        razao_social: data.tomador.razaoSocial,
        endereco: {
          logradouro: data.tomador.endereco.logradouro,
          numero: data.tomador.endereco.numero,
          bairro: data.tomador.endereco.bairro,
          codigo_municipio: data.tomador.endereco.codigoMunicipio,
          uf: data.tomador.endereco.uf,
          cep: data.tomador.endereco.cep,
        },
      },
      servico: {
        discriminacao: data.servico.discriminacao,
        valor_servicos: data.servico.valorServicos,
        iss_retido: data.servico.issRetido,
        codigo_cnae: data.servico.codigoCnae,
        item_lista_servico: data.servico.itemListaServico,
      },
    };

    const response = await axios.post(
      `${this.baseUrl}/nfse?ref=${apiRef}`,
      payload,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(apiToken + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }

  async consultarNFSe(apiToken: string, apiRef: string, numeroNota: string): Promise<any> {
    const response = await axios.get(
      `${this.baseUrl}/nfse/${numeroNota}?ref=${apiRef}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(apiToken + ':').toString('base64')}`,
        },
      }
    );

    return response.data;
  }

  async cancelarNFSe(apiToken: string, apiRef: string, numeroNota: string, motivo: string): Promise<any> {
    const response = await axios.delete(
      `${this.baseUrl}/nfse/${numeroNota}?ref=${apiRef}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(apiToken + ':').toString('base64')}`,
        },
        data: { justificativa: motivo },
      }
    );

    return response.data;
  }
}
```

#### Service: NFeService (Orquestrador)

```typescript
@Injectable()
export class NFeService {
  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
    private focusNFe: FocusNFeService,
    private encryption: EncryptionService,
  ) {}

  async emitirNFSeParaOS(serviceOrderId: string): Promise<NotaFiscal> {
    const tenantId = this.tenantContext.getTenantId();

    // Buscar configuração NFe do tenant
    const nfeConfig = await this.prisma.nFeConfig.findUnique({
      where: { tenantId },
    });

    if (!nfeConfig || !nfeConfig.isActive) {
      throw new BadRequestException('Configuração de NF-e não encontrada ou inativa');
    }

    // Buscar OS
    const os = await this.prisma.serviceOrder.findUnique({
      where: { id: serviceOrderId },
      include: {
        customer: { include: { addresses: true } },
        items: { include: { service: true } },
      },
    });

    // Montar dados da NFS-e
    const data: EmitirNFSeDto = {
      dataEmissao: new Date().toISOString(),
      tomador: {
        cnpj: os.customer.document,
        razaoSocial: os.customer.name,
        endereco: {
          logradouro: os.customer.addresses[0]?.street,
          numero: os.customer.addresses[0]?.number,
          bairro: os.customer.addresses[0]?.district,
          codigoMunicipio: '3550308', // São Paulo (buscar dinamicamente)
          uf: os.customer.addresses[0]?.state,
          cep: os.customer.addresses[0]?.zipCode,
        },
      },
      servico: {
        discriminacao: os.items.map(i => `${i.description} - Qtd: ${i.quantity}`).join('\n'),
        valorServicos: Number(os.totalAmount),
        issRetido: false,
        codigoCnae: '6209100', // Exemplo (buscar do config)
        itemListaServico: '01.01', // Exemplo (buscar do config)
      },
    };

    // Descriptografar token
    const apiToken = this.encryption.decrypt(nfeConfig.apiToken);

    // Emitir via Focus NFe
    const response = await this.focusNFe.emitirNFSe(
      { ...nfeConfig, apiToken },
      data
    );

    // Salvar nota no banco
    const nota = await this.prisma.notaFiscal.create({
      data: {
        tenantId,
        nfeConfigId: nfeConfig.id,
        customerId: os.customerId,
        serviceOrderId: os.id,
        tipo: 'nfse',
        numero: response.numero,
        serie: nfeConfig.serie,
        chaveAcesso: response.codigo_verificacao,
        protocolo: response.numero_rps,
        dataEmissao: new Date(),
        valorTotal: os.totalAmount,
        valorServicos: os.totalAmount,
        status: response.status === 'autorizado' ? 'autorizada' : 'processando',
        xmlUrl: response.url,
        pdfUrl: response.caminho_pdf_nota_fiscal,
        apiResponse: response,
      },
    });

    // Atualizar próximo número
    await this.prisma.nFeConfig.update({
      where: { id: nfeConfig.id },
      data: { proximoNumeroNFSe: { increment: 1 } },
    });

    return nota;
  }
}
```

---

## 3. Frontend - Interface de NFe

### 3.1 Página de Configuração

```typescript
// apps/web/src/app/dashboard/settings/nfe/page.tsx
export default function NFeConfigPage() {
  const { hasFeature } = useSubscription();

  if (!hasFeature('nfe')) {
    return <UpgradePrompt feature="nfe" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração de NF-e/NFS-e</CardTitle>
        </CardHeader>
        <CardBody>
          <NFeConfigForm />
        </CardBody>
      </Card>
    </div>
  );
}
```

### 3.2 Botão Emitir NFe na OS

```typescript
// apps/web/src/app/dashboard/orders/[id]/page.tsx
<FeatureGate feature="nfe">
  <Button
    onClick={() => emitirNFe(order.id)}
    disabled={order.notaFiscal}
  >
    {order.notaFiscal ? (
      <><CheckCircle /> NF-e Emitida</>
    ) : (
      <><FileText /> Emitir NF-e</>
    )}
  </Button>
</FeatureGate>
```

---

## 4. Outras Funcionalidades Avançadas

### 4.1 Contratos Recorrentes

```prisma
model Contract {
  id              String   @id @default(uuid())
  tenantId        String   @map("tenant_id")
  customerId      String   @map("customer_id")
  serviceId       String   @map("service_id")

  status          String   @default("active") // active, paused, canceled
  recurrence      String   // monthly, quarterly, yearly
  dayOfMonth      Int      @map("day_of_month") // Dia do mês para gerar OS

  valorMensal     Decimal  @map("valor_mensal") @db.Decimal(10, 2)
  dataInicio      DateTime @map("data_inicio")
  dataFim         DateTime? @map("data_fim")

  proximaCobranca DateTime @map("proxima_cobranca")

  createdAt       DateTime @default(now()) @map("created_at")

  tenant   Tenant   @relation(fields: [tenantId], references: [id])
  customer Customer @relation(fields: [customerId], references: [id])
  service  Service  @relation(fields: [serviceId], references: [id])

  generatedOrders ServiceOrder[] @relation("ContractOrders")

  @@index([tenantId, status])
  @@index([tenantId, proximaCobranca])
  @@map("contracts")
}
```

**CRON Job** (NestJS Scheduler):
```typescript
@Cron('0 0 * * *') // Todo dia às 00:00
async gerarOSRecorrentes() {
  const contratos = await this.prisma.contract.findMany({
    where: {
      status: 'active',
      proximaCobranca: { lte: new Date() },
    },
    include: { customer: true, service: true },
  });

  for (const contrato of contratos) {
    await this.createServiceOrderFromContract(contrato);

    // Atualizar próxima cobrança
    await this.prisma.contract.update({
      where: { id: contrato.id },
      data: { proximaCobranca: this.calcularProximaData(contrato) },
    });
  }
}
```

### 4.2 Integração WhatsApp

**Biblioteca**: `whatsapp-web.js` ou **API oficial** (WhatsApp Business API)

```typescript
// Enviar orçamento por WhatsApp
async enviarOrcamentoPorWhatsApp(quotationId: string) {
  const quotation = await this.getQuotation(quotationId);
  const pdfUrl = await this.generateQuotationPDF(quotation);

  await this.whatsappService.sendMessage(
    quotation.customer.phone,
    `Olá ${quotation.customer.name}!\n\nSegue o orçamento ${quotation.number} no valor de ${formatCurrency(quotation.totalAmount)}.\n\nPara aprovar, acesse: ${process.env.FRONTEND_URL}/portal/${quotation.portalToken}`
  );

  await this.whatsappService.sendMedia(
    quotation.customer.phone,
    pdfUrl,
    'orcamento.pdf'
  );
}
```

### 4.3 Relatórios Avançados

```typescript
// Relatório de Lucratividade por Serviço
async relatorioLucratividade(periodo: { inicio: Date; fim: Date }) {
  const orders = await this.prisma.serviceOrder.findMany({
    where: {
      tenantId,
      completedAt: { gte: periodo.inicio, lte: periodo.fim },
    },
    include: { items: { include: { service: true } } },
  });

  const lucro = orders.reduce((acc, order) => {
    order.items.forEach(item => {
      const servico = item.service.name;
      const receita = Number(item.totalPrice);
      const custo = 0; // Implementar controle de custos

      if (!acc[servico]) {
        acc[servico] = { receita: 0, custo: 0, lucro: 0, quantidade: 0 };
      }

      acc[servico].receita += receita;
      acc[servico].custo += custo;
      acc[servico].lucro += receita - custo;
      acc[servico].quantidade += 1;
    });

    return acc;
  }, {});

  return lucro;
}
```

### 4.4 Estoque Básico

```prisma
model Product {
  id          String  @id @default(uuid())
  tenantId    String  @map("tenant_id")
  name        String
  sku         String?
  category    String?

  // Estoque
  quantidade  Int     @default(0)
  minimo      Int     @default(0) @map("quantidade_minima")

  // Custo
  custoUnitario Decimal @map("custo_unitario") @db.Decimal(10, 2)
  precoVenda    Decimal @map("preco_venda") @db.Decimal(10, 2)

  @@unique([tenantId, sku])
  @@map("products")
}

model StockMovement {
  id          String   @id @default(uuid())
  tenantId    String   @map("tenant_id")
  productId   String   @map("product_id")

  tipo        String   // entrada, saida
  quantidade  Int
  motivo      String?  // compra, venda, ajuste, perda

  serviceOrderId String? @map("service_order_id") // Se foi usado em uma OS

  createdAt   DateTime @default(now()) @map("created_at")

  @@map("stock_movements")
}
```

---

## 5. Cronograma de Implementação

### Fase 1: NFe (4 semanas)
- **Semana 1**: Models + Migration + Config básica
- **Semana 2**: Integração Focus NFe + Testes sandbox
- **Semana 3**: Frontend (configuração + emissão)
- **Semana 4**: Testes + Produção + Docs

### Fase 2: Contratos Recorrentes (2 semanas)
- **Semana 1**: Models + CRON job + Backend
- **Semana 2**: Frontend + Testes

### Fase 3: WhatsApp (3 semanas)
- **Semana 1**: Setup API + Autenticação
- **Semana 2**: Templates de mensagens + Envio
- **Semana 3**: Webhooks + Respostas automáticas

### Fase 4: Relatórios (2 semanas)
- **Semana 1**: Relatórios backend (queries otimizadas)
- **Semana 2**: Frontend (gráficos + exportação)

### Fase 5: Estoque (2 semanas)
- **Semana 1**: Models + Movimentações + Alertas
- **Semana 2**: Frontend + Integração com OS

**Total: ~13 semanas (3 meses)**

---

## 6. Custos Estimados

### APIs Externas (por mês, assumindo 100 notas/mês)
- **Focus NFe**: R$ 25/mês (100 notas × R$0,25)
- **WhatsApp Business API**: R$ 100-300/mês (depende do volume)
- **Stripe/Paddle**: 3-5% por transação + taxa fixa

### Infraestrutura
- **Storage adicional** (XMLs/PDFs): ~R$ 5-10/mês (AWS S3)
- **CRON jobs**: Incluído no Railway/Render

**Total estimado**: R$ 130-340/mês (operação básica)

---

## 7. Considerações de Segurança

### Certificado Digital
- **NUNCA** armazenar senha em texto plano
- Criptografar com AES-256
- Usar variável de ambiente como chave de criptografia
- Certificado A1 (arquivo) é mais simples que A3 (token)

### API Tokens
- Criptografar tokens da Focus NFe
- Não expor no frontend
- Rotacionar periodicamente

### Compliance
- LGPD: Dados fiscais são sensíveis
- Backup regular dos XMLs
- Logs de auditoria de emissão/cancelamento

---

## 8. Testes Essenciais

### NFe
- [ ] Emitir nota em homologação
- [ ] Consultar status
- [ ] Cancelar nota
- [ ] Testar webhook de retorno
- [ ] Validar cálculos de impostos
- [ ] Testar múltiplos tenants simultaneamente

### Contratos Recorrentes
- [ ] CRON job gera OS corretamente
- [ ] Não duplica OS
- [ ] Respeita data de início/fim
- [ ] Calcula próxima cobrança corretamente

### WhatsApp
- [ ] Envio de mensagem
- [ ] Envio de arquivo
- [ ] Recebimento de resposta
- [ ] Rate limiting (não spam)

---

## 9. Documentação Necessária

- [ ] Manual de configuração de NFe (passo a passo)
- [ ] Tutorial de obtenção de certificado A1
- [ ] Guia de integração Focus NFe
- [ ] FAQ de erros comuns
- [ ] Documentação de API para desenvolvedores (webhooks)

---

## 10. Métricas de Sucesso

### NFe
- Tempo médio de emissão: < 10 segundos
- Taxa de erro: < 1%
- Notas autorizadas: > 99%

### Contratos
- OSs geradas automaticamente: 100% no dia correto
- Zero duplicações

### WhatsApp
- Taxa de entrega: > 95%
- Tempo de resposta: < 2 minutos

---

**Implementar SOMENTE após Planos e Acessos estar 100% funcional!**

Este roadmap assume que o sistema de billing já está validando features premium. 🚀
