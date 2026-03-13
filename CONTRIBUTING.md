# Guia de Contribuição - Solid Service

**Bem-vindo ao Solid Service!** 👋

Este documento explica como contribuir para o projeto, seguindo boas práticas de desenvolvimento e mantendo a qualidade do código.

---

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Setup do Ambiente](#setup-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Arquitetura e Princípios SOLID](#arquitetura-e-princípios-solid)
- [Workflow Git](#workflow-git)
- [Commits](#commits)
- [Pull Requests](#pull-requests)
- [Testes](#testes)
- [Revisão de Código](#revisão-de-código)

---

## 🤝 Código de Conduta

### Nossa Promessa

Nós, como membros, contribuidores e líderes, nos comprometemos a fazer da participação em nossa comunidade uma experiência livre de assédio para todos.

### Comportamento Esperado

- ✅ Usar linguagem acolhedora e inclusiva
- ✅ Ser respeitoso com diferentes pontos de vista
- ✅ Aceitar críticas construtivas com elegância
- ✅ Focar no que é melhor para a comunidade
- ✅ Mostrar empatia com outros membros

### Comportamento Inaceitável

- ❌ Linguagem ou imagens sexualizadas
- ❌ Comentários ofensivos ou depreciativos
- ❌ Ataques pessoais ou políticos
- ❌ Assédio público ou privado
- ❌ Publicar informações privadas de terceiros

---

## 🚀 Como Contribuir

### Tipos de Contribuição

1. **Reportar Bugs** 🐛
   - Use as GitHub Issues
   - Descreva o bug claramente
   - Inclua passos para reproduzir
   - Adicione logs e screenshots se possível

2. **Sugerir Features** 💡
   - Abra uma Issue descrevendo a feature
   - Explique o problema que ela resolve
   - Descreva a solução proposta
   - Aguarde feedback antes de implementar

3. **Melhorar Documentação** 📚
   - Corrigir typos
   - Adicionar exemplos
   - Melhorar explicações
   - Traduzir documentação

4. **Implementar Features** ⚡
   - Escolha uma Issue aberta
   - Comente que vai trabalhar nela
   - Siga os padrões de código
   - Adicione testes

5. **Revisar Pull Requests** 👀
   - Revise código de outros
   - Faça comentários construtivos
   - Teste localmente
   - Aprove ou solicite mudanças

---

## 🛠️ Setup do Ambiente

### 1. Fork e Clone

```bash
# Fork via GitHub UI, depois:
git clone https://github.com/SEU-USUARIO/solid-service.git
cd solid-service

# Adicionar remote upstream
git remote add upstream https://github.com/original-repo/solid-service.git
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Ambiente

Siga o guia completo em [SETUP.md](./SETUP.md).

```bash
# Backend
cd apps/api
cp .env.example .env
# Editar .env com suas configurações

# Database
cd ../../packages/database
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### 4. Verificar Setup

```bash
# Rodar testes
npm run test

# Iniciar backend
cd apps/api && npm run dev

# Em outro terminal, testar API
curl http://localhost:3000/health
```

---

## 📝 Padrões de Código

### TypeScript

**Configuração:** `tsconfig.json` na raiz e em cada workspace.

```typescript
// ✅ Bom: tipos explícitos
function calculateTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
}

// ❌ Ruim: tipos implícitos/any
function calculateTotal(items: any): any {
  return items.reduce((sum: any, item: any) => sum + item.totalPrice, 0);
}
```

### ESLint

**Regras:** `.eslintrc.js`

```bash
# Verificar linting
npm run lint

# Fix automático
npm run lint:fix
```

**Principais regras:**
- Sem `any` desnecessário
- Imports organizados
- Sem variáveis não utilizadas
- Sem console.log (use logger)

### Prettier

**Configuração:** `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

```bash
# Formatar código
npm run format
```

### Convenções de Nomenclatura

```typescript
// Classes: PascalCase
class CustomerService {}

// Interfaces: PascalCase com I prefix (opcional)
interface ICustomer {}
interface Customer {} // Preferido

// Variáveis e funções: camelCase
const totalAmount = 100;
function calculateTotal() {}

// Constantes: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// Arquivos:
// - Modules: kebab-case (customer.service.ts)
// - Components: PascalCase (CustomerList.tsx)
// - Utils: kebab-case (date-utils.ts)
```

---

## 🏗️ Arquitetura e Princípios SOLID

### Estrutura de Módulos (Backend)

```
modules/
└── customers/
    ├── customers.module.ts         # NestJS module
    ├── customers.controller.ts     # REST endpoints
    ├── customers.service.ts        # Business logic
    ├── customers.repository.ts     # Data access (opcional)
    ├── dto/
    │   ├── create-customer.dto.ts
    │   └── update-customer.dto.ts
    └── tests/
        └── customers.service.spec.ts
```

### Single Responsibility Principle (SRP)

❌ **Ruim:** Classe faz múltiplas coisas

```typescript
class CustomerService {
  async create(dto: CreateCustomerDto) {
    // Valida
    // Salva no banco
    // Envia email
    // Registra log
    // Cria timeline
  }
}
```

✅ **Bom:** Responsabilidades separadas

```typescript
class CustomerService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateCustomerDto) {
    const customer = await this.prisma.customer.create({ data: dto });
    await this.auditService.logCreate({ entity: 'Customer', entityId: customer.id });
    return customer;
  }
}
```

### Open/Closed Principle (OCP)

✅ **Bom:** Extensível sem modificar código existente

```typescript
// Estratégia de pagamento - adicionar novos métodos sem quebrar código
interface PaymentStrategy {
  process(amount: number): Promise<void>;
}

class PixPaymentStrategy implements PaymentStrategy {
  async process(amount: number) {
    // Lógica PIX
  }
}

class CreditCardPaymentStrategy implements PaymentStrategy {
  async process(amount: number) {
    // Lógica cartão
  }
}

// Fácil adicionar: BoletoBancarioStrategy, CryptoPaymentStrategy, etc
```

### Dependency Inversion Principle (DIP)

✅ **Bom:** Depender de abstrações, não implementações

```typescript
// Interface
interface INotificationService {
  send(to: string, subject: string, body: string): Promise<void>;
}

// Service depende da interface
@Injectable()
class OrderService {
  constructor(
    @Inject('INotificationService')
    private notificationService: INotificationService,
  ) {}
}

// Fácil trocar implementação (SendGrid → Resend → SES)
providers: [
  { provide: 'INotificationService', useClass: ResendService },
];
```

### Injeção de Dependências (NestJS)

```typescript
// ✅ Bom: DI via constructor
@Injectable()
class CustomerService {
  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
  ) {}
}

// ❌ Ruim: Instanciar manualmente
class CustomerService {
  private prisma = new PrismaService();
  private tenantContext = new TenantContextService();
}
```

---

## 🌿 Workflow Git

### Branches

**Estrutura:**

```
main (produção)
  └── develop (staging)
       ├── feature/add-customer-notes
       ├── feature/fix-quotation-pdf
       ├── bugfix/auth-token-expiration
       └── hotfix/critical-bug
```

**Tipos de branches:**

- `main` - Produção (sempre estável)
- `develop` - Integração (pré-produção)
- `feature/nome` - Nova funcionalidade
- `bugfix/nome` - Correção de bug
- `hotfix/nome` - Correção urgente em produção
- `refactor/nome` - Refatoração
- `docs/nome` - Documentação

### Criando uma Feature

```bash
# Atualizar develop
git checkout develop
git pull upstream develop

# Criar feature branch
git checkout -b feature/add-customer-notes

# Trabalhar...
git add .
git commit -m "feat: add notes field to customers"

# Push para seu fork
git push origin feature/add-customer-notes

# Abrir PR no GitHub
```

### Mantendo Branch Atualizada

```bash
# Atualizar com develop
git checkout develop
git pull upstream develop

git checkout feature/add-customer-notes
git rebase develop

# Resolver conflitos se houver
git add .
git rebase --continue

# Force push (OK em feature branches)
git push origin feature/add-customer-notes --force-with-lease
```

---

## 💬 Commits

### Conventional Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/).

**Formato:**

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

**Tipos:**

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (sem mudança de lógica)
- `refactor`: Refatoração de código
- `perf`: Melhoria de performance
- `test`: Adicionar/corrigir testes
- `chore`: Tarefas de manutenção

**Exemplos:**

```bash
# Feature
git commit -m "feat(customers): add notes field to customer model"

# Bugfix
git commit -m "fix(auth): resolve token expiration issue"

# Breaking change
git commit -m "feat(api)!: change customer endpoint structure

BREAKING CHANGE: /customers response now includes nested contacts"

# Multiple scopes
git commit -m "feat(customers,quotations): add relationship between entities"

# Docs
git commit -m "docs(readme): update installation instructions"

# Tests
git commit -m "test(customers): add unit tests for CustomerService"
```

### Boas Práticas de Commit

✅ **Bom:**

```bash
git commit -m "feat(quotations): add PDF generation endpoint"
git commit -m "fix(auth): prevent duplicate email registration"
git commit -m "test(orders): add E2E tests for order workflow"
```

❌ **Ruim:**

```bash
git commit -m "changes"
git commit -m "fix stuff"
git commit -m "WIP"
git commit -m "asdfasdf"
```

**Dicas:**

- Commit frequente (small commits)
- Mensagem descritiva e clara
- Um commit = uma mudança lógica
- Corpo do commit quando necessário contexto

---

## 🔃 Pull Requests

### Antes de Criar PR

```bash
# ✅ Checklist
- [ ] Código funciona localmente
- [ ] Testes passam (npm run test)
- [ ] E2E tests passam (npm run test:e2e)
- [ ] Linting OK (npm run lint)
- [ ] Formatação OK (npm run format)
- [ ] Build funciona (npm run build)
- [ ] Documentação atualizada (se necessário)
- [ ] CHANGELOG.md atualizado (se feature)
```

### Template de PR

```markdown
## Descrição

Breve descrição do que foi feito.

## Tipo de Mudança

- [ ] Bug fix (non-breaking change)
- [ ] Nova feature (non-breaking change)
- [ ] Breaking change (fix ou feature que quebra funcionalidade existente)
- [ ] Documentação

## Como Testar

1. Rodar migrations: `npx prisma migrate dev`
2. Iniciar API: `npm run dev`
3. Testar endpoint: `curl http://localhost:3000/api/v1/customers`

## Checklist

- [ ] Código segue padrões do projeto
- [ ] Comentei código complexo
- [ ] Atualizei documentação
- [ ] Testes passam localmente
- [ ] Adicionei novos testes
- [ ] Mudanças não geram novos warnings

## Screenshots (se aplicável)

![Screenshot](url)

## Issues Relacionadas

Closes #123
Refs #456
```

### Tamanho do PR

**Ideal:**
- 200-400 linhas mudadas
- Foca em UMA feature/bug
- Revisável em ~15 minutos

**Se PR muito grande:**
- Quebrar em PRs menores
- Usar feature flags
- Fazer merge incremental

---

## 🧪 Testes

### Pirâmide de Testes

```
      /\
     /E2E\       10% - Testes End-to-End
    /------\
   /Integr.\    20% - Testes de Integração
  /----------\
 /   Unit     \ 70% - Testes Unitários
/--------------\
```

### Testes Unitários

**Exemplo:**

```typescript
// customers.service.spec.ts
describe('CustomerService', () => {
  let service: CustomerService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: PrismaService,
          useValue: {
            customer: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create customer', async () => {
    const dto = { name: 'Test Customer', type: 'individual' };
    const expected = { id: 'uuid', ...dto };

    jest.spyOn(prisma.customer, 'create').mockResolvedValue(expected);

    const result = await service.create(dto);

    expect(result).toEqual(expected);
    expect(prisma.customer.create).toHaveBeenCalledWith({ data: dto });
  });
});
```

**Rodar:**

```bash
# Todos os testes unitários
npm run test

# Específico
npm run test customers.service.spec

# Com coverage
npm run test:cov
```

### Testes E2E

**Exemplo:**

```typescript
// customers.e2e-spec.ts
describe('Customers (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    // Setup app
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });

    token = response.body.accessToken;
  });

  it('/customers (POST)', async () => {
    const dto = { name: 'Test Customer', type: 'individual' };

    return request(app.getHttpServer())
      .post('/customers')
      .set('Authorization', `Bearer ${token}`)
      .send(dto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe(dto.name);
      });
  });
});
```

**Rodar:**

```bash
# Todos E2E
npm run test:e2e

# Específico
npm run test:e2e -- customers.e2e-spec
```

### Coverage Mínimo

- **Business Logic:** 90%
- **Controllers:** 70%
- **Overall:** 80%

```bash
npm run test:cov
```

---

## 👀 Revisão de Código

### Como Revisor

**Checklist:**

- [ ] Código funciona (testar localmente)
- [ ] Segue padrões do projeto
- [ ] Testes adequados
- [ ] Documentação atualizada
- [ ] Sem código duplicado
- [ ] Sem lógica complexa desnecessária
- [ ] Variáveis bem nomeadas
- [ ] Sem hardcoded values
- [ ] Segurança (sem vazamento de dados, SQL injection, etc)
- [ ] Performance adequada

**Comentários:**

✅ **Bom:**

```
Sugestão: Podemos extrair essa lógica para um helper?

```typescript
// Antes
const total = items.reduce((sum, i) => sum + Number(i.price) * Number(i.qty), 0);

// Depois
const total = calculateItemsTotal(items);
```

❌ **Ruim:**

```
Esse código tá uma merda, refaz tudo.
```

**Tipos de comentários:**

- 🔴 **BLOCKER:** Deve ser corrigido antes do merge
- 🟡 **SUGGESTION:** Melhoria opcional
- 🟢 **PRAISE:** Código muito bom, parabéns!

### Como Autor

**Ao receber review:**

- ✅ Aceite críticas construtivas
- ✅ Responda comentários educadamente
- ✅ Implemente sugestões razoáveis
- ✅ Explique decisões quando necessário
- ❌ Não leve para o lado pessoal
- ❌ Não ignore feedbacks

---

## 🔒 Segurança

### Checklist de Segurança

- [ ] Nunca commitear secrets (.env, keys)
- [ ] Validar todos inputs (class-validator)
- [ ] Sanitizar outputs (prevenir XSS)
- [ ] Usar prepared statements (Prisma já faz)
- [ ] Autenticar endpoints (Guards)
- [ ] Autorizar ações (RBAC)
- [ ] Rate limiting configurado
- [ ] HTTPS em produção
- [ ] Dependências atualizadas (`npm audit`)

### Reportar Vulnerabilidades

**NÃO** abra issue pública. Envie email para:

```
security@solid-service.com
```

---

## 📚 Recursos

### Documentação

- [README.md](./README.md) - Visão geral
- [SETUP.md](./SETUP.md) - Setup local
- [DEPLOY.md](./DEPLOY.md) - Deploy produção
- [API.md](./API.md) - Documentação da API
- [RBAC.md](./RBAC.md) - Controle de acesso

### Links Úteis

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Conventional Commits](https://www.conventionalcommits.org/)

### Comunidade

- GitHub Issues: Discussões técnicas
- GitHub Discussions: Perguntas gerais
- Discord: Chat em tempo real (em breve)

---

## 🎉 Obrigado!

Agradecemos sua contribuição para o Solid Service! 🚀

**Perguntas?** Abra uma [Issue](https://github.com/seu-usuario/solid-service/issues) ou [Discussion](https://github.com/seu-usuario/solid-service/discussions).

---

**Happy coding!** 💻
