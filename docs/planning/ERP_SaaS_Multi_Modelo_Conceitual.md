# Modelo conceitual - ERP SaaS para prestadores de servicos

## 1. Objetivo

Este documento descreve o modelo conceitual do produto, sem entrar em detalhes tecnicos de implementacao.

## 2. Entidades centrais

### 2.1 Tenant

Representa a empresa cliente da plataforma.

Relacionamentos:

- possui usuarios
- possui clientes
- possui servicos
- possui OS
- possui recebiveis
- possui configuracoes

### 2.2 Usuario

Pessoa que acessa o sistema internamente.

Relacionamentos:

- pertence a um tenant
- pode executar servicos
- pode criar orcamentos, OS e registros financeiros

### 2.3 Cliente

Pessoa ou empresa atendida pelo tenant.

Relacionamentos:

- possui contatos
- possui enderecos
- possui historico
- possui orcamentos
- possui OS
- possui cobrancas

### 2.4 Servico

Catalogo de servicos ofertados.

Relacionamentos:

- pode ser usado em orcamentos
- pode ser usado em OS
- pode ter checklist padrao

### 2.5 Orcamento

Documento comercial para proposta de servico.

Relacionamentos:

- pertence a cliente
- contem itens
- pode gerar OS

### 2.6 Ordem de servico

Registro operacional da execucao.

Relacionamentos:

- pertence a cliente
- pode nascer de orcamento
- possui agenda
- possui anexos
- possui checklist
- pode gerar cobranca

### 2.7 Agenda

Compromisso operacional ligado a uma OS.

Relacionamentos:

- pertence a OS
- pode ter profissional responsavel

### 2.8 Recebivel

Registro de valor a receber.

Relacionamentos:

- pode nascer de OS
- pode nascer de orcamento aprovado
- pode ter pagamentos

### 2.9 Pagamento

Registro de liquidacao de um recebivel.

Relacionamentos:

- pertence a um recebivel

### 2.10 Anexo

Arquivo ou evidencia.

Relacionamentos:

- pode pertencer a cliente
- pode pertencer a OS

## 3. Relacoes principais

- Tenant 1:N Usuarios
- Tenant 1:N Clientes
- Tenant 1:N Servicos
- Cliente 1:N Orcamentos
- Cliente 1:N OS
- Orcamento 1:N Itens
- Orcamento 1:0..1 OS
- OS 1:N Agendamentos/Eventos
- OS 1:N Anexos
- OS 1:N Checklist respostas
- OS 1:N Recebiveis
- Recebivel 1:N Pagamentos

## 4. Estruturas configuraveis

- tipos de servico
- status de OS dentro de uma faixa controlada
- templates de checklist
- templates de mensagem
- identidade visual do tenant

## 5. Entidades futuras

- contratos
- recorrencia
- estoque
- comissoes
- pacotes verticais
- notas fiscais por integracao
