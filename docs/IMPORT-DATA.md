# 📊 Importação de Dados via Excel/CSV

## Visão Geral

Sistema completo para importar dados de planilhas Excel ou CSV, facilitando a migração de ERPs antigos ou sistemas locais.

## Acesso

**URL:** `/dashboard/import`
**Menu:** Sidebar → "Importar Dados"

## Entidades Suportadas

### 1. **Clientes** 👥
Importe sua base de clientes com informações completas

**Campos:**
- nome
- email
- telefone
- documento (CPF/CNPJ)
- tipo (pessoa_fisica | pessoa_juridica)
- endereço
- cidade
- estado
- cep

### 2. **Serviços** 🔧
Catálogo de serviços e preços

**Campos:**
- nome
- descrição
- preço
- unidade (hora | serviço | m² | etc)
- categoria
- tempo_estimado (minutos)
- garantia (dias)

### 3. **Fornecedores** 🏢
Base de fornecedores e parceiros

**Campos:**
- razao_social
- nome_fantasia
- cnpj
- email
- telefone
- contato (nome do contato)
- endereço

### 4. **Produtos** 📦
Estoque e produtos para venda

**Campos:**
- nome
- código (SKU)
- preço_compra
- preço_venda
- estoque (quantidade)
- fornecedor
- categoria

## Processo de Importação

### Passo 1: Escolher Entidade
Selecione o que deseja importar (Clientes, Serviços, Fornecedores ou Produtos)

### Passo 2: Baixar Template
- Clique em "Baixar Template"
- Abrirá um arquivo CSV com os cabeçalhos corretos
- Preencha os dados seguindo o formato

### Passo 3: Preparar Planilha

**Importante:**
- Mantenha os nomes das colunas exatamente como no template
- Não deixe linhas em branco
- Use formato correto para cada campo:
  - **Datas:** DD/MM/YYYY ou YYYY-MM-DD
  - **Números:** Use ponto como separador decimal (ex: 1500.50)
  - **Telefones:** (XX) XXXXX-XXXX
  - **CPF:** XXX.XXX.XXX-XX
  - **CNPJ:** XX.XXX.XXX/XXXX-XX

### Passo 4: Upload
- Arraste e solte ou clique para selecionar o arquivo
- Formatos aceitos: `.xlsx`, `.xls`, `.csv`
- Tamanho máximo: 10 MB

### Passo 5: Análise
- Sistema analisa a planilha
- Mostra prévia dos dados
- Valida campos obrigatórios
- Detecta possíveis erros

### Passo 6: Importação
- Revise a prévia
- Clique em "Importar"
- Acompanhe o progresso
- Veja relatório de sucesso/erros

## Validações Automáticas

### Clientes
- ✅ Email único
- ✅ Documento (CPF/CNPJ) válido e único
- ✅ Telefone no formato correto
- ✅ CEP válido (8 dígitos)

### Serviços
- ✅ Nome único
- ✅ Preço maior que zero
- ✅ Unidade válida

### Fornecedores
- ✅ CNPJ válido e único
- ✅ Email válido
- ✅ Telefone no formato correto

### Produtos
- ✅ Código (SKU) único
- ✅ Preços maiores que zero
- ✅ Estoque não negativo

## Tratamento de Erros

### Durante a Importação:
- **Duplicados:** Registros com email/documento/código já existentes são pulados
- **Campos Inválidos:** Linha é rejeitada e erro é reportado
- **Campos Vazios:** Campos obrigatórios vazios causam erro

### Relatório Final:
- ✅ **Importados:** Quantidade de registros criados com sucesso
- ❌ **Erros:** Lista detalhada de erros por linha
- ⚠️ **Avisos:** Possíveis problemas que não impedem a importação

## Exemplo de Template - Clientes

```csv
nome,email,telefone,documento,tipo,endereço,cidade,estado,cep
João Silva,joao@email.com,(11) 98765-4321,123.456.789-00,pessoa_fisica,Rua A 123,São Paulo,SP,01310-100
Maria Santos Ltda,contato@maria.com,(11) 98765-4322,12.345.678/0001-90,pessoa_juridica,Av B 456,Rio de Janeiro,RJ,20040-020
```

## Boas Práticas

### ✅ Fazer
- Testar com poucos registros primeiro
- Revisar dados antes de importar
- Manter backup do arquivo original
- Usar templates fornecidos
- Validar emails e documentos

### ❌ Evitar
- Arquivos muito grandes (> 10 MB)
- Caracteres especiais nos nomes de colunas
- Linhas em branco
- Formatos de data inconsistentes
- Duplicar dados já existentes

## Limitações

- **Tamanho:** Máximo 10 MB por arquivo
- **Registros:** Recomendado até 5.000 por importação
- **Timeout:** Importações longas podem exceder o tempo limite
- **Relações:** Importações em lote não criam relacionamentos automáticos

## Dicas de Performance

### Para arquivos grandes:
1. Divida em múltiplas planilhas menores
2. Importe em horários de baixo uso
3. Remova colunas desnecessárias
4. Use formato CSV ao invés de XLSX

## Próximos Passos

Após importação bem-sucedida:
- ✅ Verifique os dados importados
- ✅ Configure relacionamentos manualmente se necessário
- ✅ Ajuste campos que precisam de edição
- ✅ Exclua registros duplicados se houver

## Suporte

Problemas durante a importação?
- Verifique o formato do arquivo
- Consulte os erros detalhados no relatório
- Entre em contato com suporte técnico

---

**Versão:** 1.0
**Última atualização:** 2024-03-30
