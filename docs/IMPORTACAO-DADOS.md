# Guia de Importação de Dados

## 📋 Tipos de Importação Disponíveis

### 1. Clientes (Customers)
Importe sua base de clientes com todos os dados de contato e endereço.

**Campos Obrigatórios:**
- `nome` - Nome ou razão social do cliente
- `documento` - CPF (11 dígitos) ou CNPJ (14 dígitos)

**Campos Opcionais:**
- `email` - Email do contato
- `telefone` - Telefone do contato
- `nome_contato` - Nome da pessoa de contato (se diferente do nome do cliente)
- `endereco` - Logradouro (rua, avenida, etc)
- `numero` - Número do imóvel
- `complemento` - Complemento (apto, sala, bloco, etc)
- `bairro` - Bairro
- `cidade` - Cidade
- `estado` - UF (2 letras)
- `cep` - CEP (8 dígitos)

**Exemplo CSV:**
```csv
nome,documento,email,telefone,endereco,numero,bairro,cidade,estado,cep
João Silva,12345678900,joao@email.com,(11) 98765-4321,Rua das Flores,123,Centro,São Paulo,SP,01234-567
```

---

### 2. Serviços (Services)
Catálogo de serviços oferecidos pela empresa.

**Campos Obrigatórios:**
- `nome` - Nome do serviço
- `preco` - Preço padrão (use ponto ou vírgula como separador decimal)

**Campos Opcionais:**
- `descricao` - Descrição detalhada do serviço
- `unidade` - Unidade de medida (hora, dia, unidade, etc)
- `categoria` - Categoria do serviço
- `tempo_estimado` - Tempo estimado em minutos
- `garantia` - Período de garantia

**Exemplo CSV:**
```csv
nome,descricao,preco,unidade,tempo_estimado
Instalação Elétrica,Instalação completa de sistema elétrico,250.00,hora,120
Manutenção Preventiva,Revisão geral dos sistemas,150.50,hora,90
```

---

### 3. Fornecedores (Suppliers)
Base de fornecedores e parceiros comerciais.

**Campos Obrigatórios:**
- `razao_social` - Razão social do fornecedor
- `cnpj` - CNPJ (14 dígitos)

**Campos Opcionais:**
- `email` - Email de contato
- `telefone` - Telefone de contato
- `notas` - Observações gerais

**Exemplo CSV:**
```csv
razao_social,cnpj,email,telefone,notas
Fornecedor ABC Ltda,12345678000190,contato@fornecedorabc.com,(11) 3333-4444,Fornecedor principal de peças
```

---

### 4. Importar Tudo (ALL)
Importe clientes, serviços e fornecedores em uma única planilha.

**Campo Adicional Obrigatório:**
- `tipo` - Valores aceitos:
  - `cliente` ou `customer` para clientes
  - `serviço`, `servico` ou `service` para serviços
  - `fornecedor` ou `supplier` para fornecedores

**Exemplo CSV:**
```csv
tipo,nome,documento,email,preco,razao_social,cnpj
cliente,João Silva,12345678900,joao@email.com,,,
servico,Instalação Elétrica,,,,250.00,,
fornecedor,,,,,Fornecedor ABC,12345678000190
```

---

## ✅ Validações Automáticas

### CPF/CNPJ
- **Aceita qualquer formato:**
  - Com formatação: `123.456.789-00` ou `12.345.678/0001-90`
  - Sem formatação: `12345678900` ou `12345678000190`
  - Com espaços ou outros caracteres: `123 456 789 00`
- **Preenche zeros à esquerda automaticamente:**
  - Se o Excel remover zeros, o sistema os adiciona automaticamente
- **Valida matematicamente:**
  - Verifica os dígitos verificadores do CPF/CNPJ
  - Rejeita sequências repetidas (111.111.111-11, etc)

### CEP
- Remove formatação automaticamente
- Aceita com ou sem hífen: `12345-678` ou `12345678`

### Preços
- Aceita ponto ou vírgula como separador decimal
- Exemplos válidos: `250.50`, `250,50`, `250.5`, `250,5`

---

## 📊 Formato do Arquivo

### Formatos Aceitos
- Excel: `.xlsx` ou `.xls`
- CSV: `.csv`

### Estrutura
- **Primeira linha:** Nomes das colunas (cabeçalho)
- **Demais linhas:** Dados
- **Normalização automática:** O sistema remove acentos, converte para minúsculas e substitui espaços por underscores

**Exemplos de nomes de colunas aceitos:**
- `Nome`, `NOME`, `nome` → `nome`
- `Razão Social`, `razao social`, `RAZAO_SOCIAL` → `razao_social`
- `CPF/CNPJ`, `Documento`, `documento` → `documento`

---

## 🔍 Preview e Validação

Antes da importação:
1. O sistema analisa o arquivo
2. Mostra preview das primeiras 10 linhas
3. Valida a estrutura (colunas obrigatórias)
4. Permite edição dos dados antes de confirmar

---

## ⚠️ Tratamento de Erros

### Erros por Linha
- Se uma linha tiver erro, as demais continuam sendo processadas
- O relatório final mostra:
  - ✅ Quantidade de sucessos
  - ❌ Quantidade de erros
  - 📋 Detalhes de cada erro (número da linha + motivo)

### Erros Comuns
1. **"Nome e documento são obrigatórios"**
   - Certifique-se de que todas as linhas têm esses campos preenchidos

2. **"CPF/CNPJ inválido"**
   - Verifique se o documento tem o formato correto
   - O sistema valida matematicamente os dígitos

3. **"Cliente/Serviço/Fornecedor já existe"**
   - Não é possível importar registros duplicados
   - Verifique se o CPF/CNPJ ou nome já estão cadastrados

4. **"Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos"**
   - Certifique-se de que o CPF tem 11 dígitos e o CNPJ tem 14

---

## 💡 Dicas

1. **Teste com poucos registros primeiro:**
   - Importe 2-3 linhas para validar o formato
   - Depois importe o restante

2. **Use o template:**
   - Baixe o template na interface de importação
   - Preencha seguindo o exemplo

3. **Excel removendo zeros:**
   - Se o Excel remover zeros à esquerda de CPFs
   - Formate a coluna como "Texto" antes de colar os dados
   - Ou deixe assim - o sistema adiciona os zeros automaticamente!

4. **Formatação de documentos:**
   - Não precisa se preocupar com pontos, traços ou barras
   - O sistema limpa e valida automaticamente

5. **Importar Tudo:**
   - Use quando tiver dados mistos na mesma planilha
   - Lembre-se de adicionar a coluna `tipo`
   - Valores aceitos: cliente/customer, serviço/servico/service, fornecedor/supplier

---

## 📝 Templates Prontos

### Template Clientes
```csv
nome,documento,email,telefone,nome_contato,endereco,numero,complemento,bairro,cidade,estado,cep
```

### Template Serviços
```csv
nome,descricao,preco,unidade,categoria,tempo_estimado,garantia
```

### Template Fornecedores
```csv
razao_social,cnpj,email,telefone,notas
```

### Template Tudo
```csv
tipo,nome,documento,email,telefone,preco,descricao,razao_social,cnpj,notas
```
