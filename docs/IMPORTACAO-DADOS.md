# 📊 Guia Completo de Importação de Dados

> **Versão:** 2.0 | **Última atualização:** 2026-04-07

## 📋 Visão Geral

Sistema completo para importar dados de planilhas Excel ou CSV, facilitando a migração de sistemas legados, ERPs antigos ou planilhas locais para o Solid Service.

### Acesso

- **URL:** `/dashboard/import`
- **Menu:** Sidebar → "Importar Dados"
- **Requisitos:** Usuário autenticado com permissões de criação

---

## 🎯 Tipos de Importação Disponíveis

### 1. **Clientes** 👥

Importe sua base completa de clientes com informações de contato e endereço.

#### Campos Obrigatórios
- `nome` - Nome completo (pessoa física) ou Razão Social (pessoa jurídica)
- `documento` - CPF (11 dígitos) ou CNPJ (14 dígitos)

#### Campos Opcionais
- **Contato:**
  - `email` - Email principal
  - `telefone` - Telefone de contato
  - `nome_contato` - Nome da pessoa de contato (se diferente do nome do cliente)

- **Endereço:**
  - `endereco` - Logradouro (rua, avenida, etc)
  - `numero` - Número do imóvel
  - `complemento` - Complemento (apto, sala, bloco, etc)
  - `bairro` - Bairro
  - `cidade` - Cidade
  - `estado` - UF (2 letras: SP, RJ, MG, etc)
  - `cep` - CEP (8 dígitos, com ou sem formatação)

#### Exemplo CSV
```csv
nome,documento,email,telefone,nome_contato,endereco,numero,complemento,bairro,cidade,estado,cep
João Silva,12345678900,joao@email.com,(11) 98765-4321,João Silva,Rua das Flores,123,Apto 45,Centro,São Paulo,SP,01310-100
Empresa XYZ Ltda,12345678000190,contato@xyz.com,(11) 3333-4444,Maria Santos,Av Paulista,1000,12º andar,Bela Vista,São Paulo,SP,01310-200
```

#### Validações Automáticas
- ✅ CPF/CNPJ matematicamente válido
- ✅ Tipo detectado automaticamente (individual = CPF, company = CNPJ)
- ✅ Documento único por tenant
- ✅ Zeros à esquerda adicionados automaticamente
- ✅ Formatação removida automaticamente

---

### 2. **Serviços** 🔧

Catálogo de serviços oferecidos pela sua empresa.

#### Campos Obrigatórios
- `nome` - Nome do serviço
- `preco` - Preço padrão (use ponto ou vírgula como separador decimal)

#### Campos Opcionais
- `descricao` - Descrição detalhada do serviço
- `tempo_estimado` - Tempo estimado de execução em **minutos**

#### Exemplo CSV
```csv
nome,descricao,preco,tempo_estimado
Instalação Elétrica,Instalação completa de sistema elétrico residencial,250.00,120
Manutenção Preventiva,Revisão geral dos sistemas,150.50,90
Troca de Tomadas,Substituição de tomadas antigas,80.00,30
```

#### Validações Automáticas
- ✅ Preço maior que zero
- ✅ Nome único por tenant
- ✅ Tempo estimado em minutos (número inteiro)

---

### 3. **Fornecedores** 🏢

Base de fornecedores e parceiros comerciais.

#### Campos Obrigatórios
- `razao_social` - Razão social do fornecedor
- `cnpj` - CNPJ (14 dígitos)

#### Campos Opcionais
- `email` - Email de contato
- `telefone` - Telefone de contato
- `notas` - Observações gerais sobre o fornecedor

#### Exemplo CSV
```csv
razao_social,cnpj,email,telefone,notas
Fornecedor ABC Ltda,12345678000190,contato@fornecedorabc.com,(11) 3333-4444,Fornecedor principal de peças elétricas
Materiais XYZ S/A,98765432000111,vendas@xyz.com,(11) 2222-3333,Entrega expressa disponível
```

#### Validações Automáticas
- ✅ CNPJ matematicamente válido
- ✅ CNPJ único por tenant
- ✅ Zeros à esquerda adicionados automaticamente
- ✅ Formatação removida automaticamente

---

### 4. **Importar Tudo** 📦

Importe clientes, serviços e fornecedores em uma única planilha.

#### Campo Adicional Obrigatório
- `tipo` - Define qual entidade será criada:
  - `cliente` ou `customer` → Cria um cliente
  - `serviço`, `servico` ou `service` → Cria um serviço
  - `fornecedor` ou `supplier` → Cria um fornecedor

#### Exemplo CSV
```csv
tipo,nome,documento,email,telefone,preco,descricao,tempo_estimado,razao_social,cnpj,notas
cliente,João Silva,12345678900,joao@email.com,(11) 98765-4321,,,,,
servico,Instalação Elétrica,,,,,Instalação completa de sistema elétrico,250.00,120,,
fornecedor,,,,,,,Fornecedor ABC Ltda,12345678000190,contato@fornecedorabc.com,(11) 3333-4444,Fornecedor principal
```

#### Dica
Use este modo quando tiver dados mistos na mesma planilha ou quando estiver migrando de um sistema que exporta tudo junto.

---

## ✅ Validações e Processamento Automático

### CPF/CNPJ

O sistema aceita documentos em **qualquer formato** e faz normalização automática:

#### Formatos Aceitos
- ✅ Com formatação: `123.456.789-00` ou `12.345.678/0001-90`
- ✅ Sem formatação: `12345678900` ou `12345678000190`
- ✅ Com espaços: `123 456 789 00`
- ✅ Parcialmente formatado: `123.456.78900`

#### Correção Automática
- **Zeros à esquerda:** Se o Excel remover zeros, o sistema os adiciona automaticamente
  - Exemplo: `1234567890` → `01234567890` (CPF)
  - Exemplo: `12345678000` → `00012345678000` (CNPJ)

#### Validação Matemática
- ✅ Verifica dígitos verificadores (algoritmo oficial)
- ❌ Rejeita sequências repetidas (`111.111.111-11`, `000.000.000-00`)
- ❌ Rejeita documentos com comprimento inválido

#### Detecção Automática de Tipo
- **11 dígitos** → Cliente tipo `individual` (Pessoa Física)
- **14 dígitos** → Cliente tipo `company` (Pessoa Jurídica)

### CEP

- Remove formatação automaticamente
- Aceita com ou sem hífen: `12345-678` ou `12345678`
- Valida comprimento (8 dígitos)

### Preços

- Aceita ponto ou vírgula como separador decimal
- Exemplos válidos: `250.50`, `250,50`, `250.5`, `250,5`
- Valida valor maior que zero

### Tempo Estimado

- Valor em **minutos** (número inteiro)
- Exemplos: `30`, `60`, `120`, `240`

---

## 📊 Formato do Arquivo

### Formatos Aceitos

- **Excel:** `.xlsx` ou `.xls`
- **CSV:** `.csv` (UTF-8 com BOM para compatibilidade com Excel)

### Estrutura

1. **Primeira linha:** Nomes das colunas (cabeçalho)
2. **Demais linhas:** Dados (uma entidade por linha)
3. **Máximo:** 10 MB por arquivo
4. **Recomendado:** Até 5.000 registros por importação

### Normalização Automática de Colunas

O sistema normaliza automaticamente os nomes das colunas:
- Remove acentos
- Converte para minúsculas
- Substitui espaços por underscores

**Exemplos:**
- `Nome`, `NOME`, `nome` → `nome` ✅
- `Razão Social`, `razao social`, `RAZAO_SOCIAL` → `razao_social` ✅
- `CPF/CNPJ`, `Documento`, `documento` → `documento` ✅

---

## 🔍 Processo de Importação

### Passo 1: Escolher Entidade

Selecione o tipo de dado que deseja importar:
- Clientes
- Serviços
- Fornecedores
- Importar Tudo

### Passo 2: Baixar Template

1. Clique em "Baixar Template"
2. Abrirá um arquivo CSV com:
   - ✅ Cabeçalhos corretos
   - ✅ Linha de exemplo com dados reais
3. Preencha os dados seguindo o formato do exemplo

### Passo 3: Preparar Planilha

**Dicas importantes:**
- ✅ Mantenha os nomes das colunas exatamente como no template
- ✅ Não deixe linhas em branco no meio dos dados
- ✅ Use o formato correto para cada campo (veja seção "Validações")
- ✅ Salve como CSV UTF-8 para melhor compatibilidade

**Excel removendo zeros:**
- Se o Excel remover zeros de CPFs (ex: `01234567890` vira `1234567890`)
- **Solução 1:** Formate a coluna como "Texto" antes de colar
- **Solução 2:** Deixe assim! O sistema adiciona os zeros automaticamente ✨

### Passo 4: Upload e Análise

1. Arraste e solte ou clique para selecionar o arquivo
2. Clique em "Analisar Arquivo"
3. Aguarde a análise (poucos segundos)
4. Veja a prévia dos dados e possíveis erros

### Passo 5: Pré-visualização e Edição

**Recursos disponíveis:**
- 📋 Visualização das primeiras 10 linhas
- ✏️ Edição direta na tabela
- ✨ Correção automática com IA (para documentos)
- ⚠️ Lista detalhada de erros de validação
- 🔄 Restaurar dados originais

**Correção com IA:**
- Detecta documentos com formatação problemática
- Tenta corrigir automaticamente
- Oferece opções caso não consiga corrigir

### Passo 6: Importação

1. Revise os dados (edite se necessário)
2. Clique em "Importar"
3. Acompanhe o progresso
4. Veja relatório final:
   - ✅ Quantidade de sucessos
   - ❌ Quantidade de erros
   - 📋 Detalhes de cada erro

---

## ⚠️ Tratamento de Erros

### Durante a Importação

O sistema processa **linha por linha**:
- ✅ Linhas válidas são importadas
- ❌ Linhas com erro são ignoradas e reportadas
- 📊 Relatório final mostra o resultado de cada linha

### Erros Comuns e Soluções

#### 1. "Nome e documento são obrigatórios"
- **Causa:** Campos obrigatórios vazios
- **Solução:** Preencha todos os campos obrigatórios

#### 2. "CPF/CNPJ inválido"
- **Causa:** Documento com dígitos verificadores incorretos
- **Solução:**
  - Use a correção com IA ✨
  - Ou corrija manualmente
  - Ou use `SKIP_DOCUMENT_VALIDATION=true` para dados de teste

#### 3. "Cliente/Serviço/Fornecedor já existe"
- **Causa:** Documento ou nome já cadastrado
- **Solução:** Verifique duplicatas na base ou na planilha

#### 4. "Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos"
- **Causa:** Quantidade de dígitos incorreta
- **Solução:** Verifique o documento original

#### 5. "Preço inválido (deve ser maior que zero)"
- **Causa:** Preço zero, negativo ou não numérico
- **Solução:** Corrija o preço na planilha

### Relatório de Erros

Ao final da importação, você receberá:
- **✅ Importados:** Registros criados com sucesso
- **❌ Erros:** Lista detalhada com:
  - Número da linha
  - Motivo do erro
  - Dados que causaram o erro
- **⚠️ Avisos:** Possíveis problemas não bloqueantes

---

## 💡 Boas Práticas

### ✅ Recomendado

1. **Teste com poucos registros primeiro**
   - Importe 2-3 linhas para validar o formato
   - Depois importe o restante em lotes maiores

2. **Use os templates fornecidos**
   - Baixe o template na interface
   - Preencha seguindo os exemplos
   - Não altere os nomes das colunas

3. **Mantenha backup**
   - Sempre mantenha uma cópia do arquivo original
   - Facilita correções se necessário

4. **Valide dados antes de importar**
   - Use a pré-visualização
   - Corrija erros na interface
   - Ou edite o arquivo e faça novo upload

5. **Divida arquivos grandes**
   - Se tiver mais de 5.000 registros
   - Divida em múltiplos arquivos menores
   - Importe em lotes

### ❌ Evitar

1. **Arquivos muito grandes** (> 10 MB)
2. **Caracteres especiais nos nomes de colunas**
3. **Linhas em branco** no meio dos dados
4. **Formatos de data inconsistentes**
5. **Duplicar dados já existentes**
6. **Modificar template** (adicionar/remover colunas sem necessidade)

---

## 🚀 Recursos Avançados

### Correção Automática com IA ✨

Quando houver erros de documento (CPF/CNPJ):
1. Clique em "Corrigir com IA"
2. O sistema tenta corrigir automaticamente:
   - Adiciona zeros à esquerda
   - Remove formatação problemática
   - Valida dígitos verificadores
3. Re-analisa o arquivo com as correções
4. Mostra novos resultados

**Se não conseguir corrigir:**
- Oferece opção de importar sem documento
- Ou permite edição manual

### Edição Direta na Tabela

- Clique em qualquer célula para editar
- Células com erro ficam destacadas em vermelho
- Células válidas ficam em verde
- Ao editar, veja a mensagem de erro abaixo da célula

### Validação em Tempo Real

- Cores indicam status:
  - 🔴 Vermelho: Erro de validação
  - 🟢 Verde: Campo válido
  - ⚪ Cinza: Não validado ainda

---

## 📝 Templates Prontos

### Template Clientes
```csv
nome,documento,email,telefone,nome_contato,endereco,numero,complemento,bairro,cidade,estado,cep
João Silva,12345678900,joao@email.com,(11) 98765-4321,João Silva,Rua das Flores,123,Apto 45,Centro,São Paulo,SP,01310-100
```

### Template Serviços
```csv
nome,descricao,preco,tempo_estimado
Instalação Elétrica,Instalação completa de sistema elétrico residencial,250.00,120
```

### Template Fornecedores
```csv
razao_social,cnpj,email,telefone,notas
Fornecedor ABC Ltda,12345678000190,contato@fornecedorabc.com,(11) 3333-4444,Fornecedor principal de peças elétricas
```

### Template Tudo
```csv
tipo,nome,documento,email,telefone,preco,descricao,tempo_estimado,razao_social,cnpj,notas
cliente,João Silva,12345678900,joao@email.com,(11) 98765-4321,,,,,,
servico,Instalação Elétrica,,,,250.00,Instalação completa de sistema elétrico,120,,,
fornecedor,,,,,,,,,Fornecedor ABC Ltda,12345678000190,contato@fornecedorabc.com
```

---

## 🔒 Segurança e Isolamento

- ✅ Todos os dados são isolados por **tenant** (multi-tenant)
- ✅ Validações matemáticas de CPF/CNPJ
- ✅ Documentos únicos por tenant
- ✅ Limite de 10 MB por arquivo
- ✅ Sanitização de dados na importação

---

## ⚙️ Variáveis de Ambiente

### SKIP_DOCUMENT_VALIDATION

Para ambientes de desenvolvimento/teste, você pode pular a validação de CPF/CNPJ:

```bash
SKIP_DOCUMENT_VALIDATION=true
```

**⚠️ IMPORTANTE:** Nunca use em produção!

---

## 🆘 Suporte

### Problemas durante a importação?

1. **Verifique o formato do arquivo**
   - Confira se está em .xlsx, .xls ou .csv
   - Verifique o tamanho (máx 10 MB)

2. **Consulte os erros detalhados**
   - Veja o relatório final
   - Corrija linha por linha

3. **Use a documentação**
   - Verifique os exemplos
   - Siga as boas práticas

4. **Entre em contato**
   - Se o problema persistir
   - Envie o arquivo de exemplo

---

## 📊 Limitações

- **Tamanho:** Máximo 10 MB por arquivo
- **Registros:** Recomendado até 5.000 por importação
- **Timeout:** Importações muito longas podem exceder tempo limite (2 minutos)
- **Relações:** Importações não criam relacionamentos complexos automaticamente
- **Anexos:** Não é possível importar arquivos anexos

---

## 🎯 Próximos Passos

Após importação bem-sucedida:
1. ✅ Verifique os dados importados nas respectivas páginas
2. ✅ Configure relacionamentos adicionais se necessário
3. ✅ Ajuste campos que precisam de edição
4. ✅ Exclua registros duplicados se houver
5. ✅ Configure preferências de notificação

---

**Versão:** 2.0
**Última atualização:** 2026-04-07
**Compatível com:** Solid Service API v1.0+
