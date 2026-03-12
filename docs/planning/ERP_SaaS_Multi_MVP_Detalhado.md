# MVP detalhado - ERP SaaS para prestadores de servicos

## 1. Objetivo do MVP

O MVP deve provar que o produto resolve o problema central de organizacao operacional e cobranca para prestadores de servico. Ele nao precisa cobrir toda a complexidade financeira ou todos os nichos, mas precisa permitir uso real no dia a dia.

## 2. Resultado esperado do MVP

Ao final do MVP, um cliente piloto deve conseguir:

- cadastrar clientes
- cadastrar tipos de servico
- criar orcamentos
- converter orcamentos em ordens de servico
- agendar execucao
- registrar anexos, checklist e conclusao
- cobrar e registrar recebimento simples
- permitir acompanhamento basico pelo cliente

## 3. Escopo funcional do MVP

### 3.1 Entram no MVP

1. Multi-tenant basico
2. Usuarios e perfis basicos
3. Clientes e contatos
4. Enderecos/unidades de atendimento
5. Catalogo de servicos
6. Orcamentos
7. Aceite basico por link
8. Ordens de servico
9. Agenda simples
10. Checklist e anexos
11. Conclusao de servico
12. Contas a receber simples
13. Registro manual de pagamento
14. Dashboard operacional inicial
15. Portal do cliente basico
16. Notificacoes essenciais

### 3.2 Nao entram no MVP

- contas a pagar avancadas
- fluxo de caixa completo
- conciliacao bancaria robusta
- estoque detalhado
- contratos avancados
- comissoes
- multiunidade complexa
- analytics avancado
- automacoes sofisticadas
- customizacoes profundas por nicho

## 4. Casos de uso que o MVP precisa suportar

### 4.1 Fluxo 1 - Orcamento e servico

1. Cliente entra em contato
2. Atendimento registra cliente
3. Orcamento e criado
4. Cliente aprova
5. Sistema gera OS
6. Servico e agendado
7. Profissional executa e conclui
8. Sistema gera cobranca simples

### 4.2 Fluxo 2 - Servico sem orcamento formal

1. Cliente solicita servico
2. Atendimento cria OS diretamente
3. Agenda e definida
4. Execucao acontece
5. Comprovantes sao anexados
6. Pagamento e registrado

### 4.3 Fluxo 3 - Acompanhamento do cliente

1. Cliente recebe link
2. Consulta status
3. Aprova servico/orcamento
4. Acessa comprovante
5. Visualiza historico basico

## 5. Criterios de sucesso do MVP

- cliente piloto consegue operar ao menos 80 por cento do fluxo em um unico sistema
- reducao perceptivel no uso de papel, planilha ou mensagens soltas
- ao menos 3 clientes piloto usam semanalmente
- equipe/usuario principal consegue aprender o fluxo em pouco tempo
- processo de orcamento e cobranca fica mais rapido que o modelo anterior

## 6. Requisitos minimos por modulo

### 6.1 Clientes

- cadastro rapido
- busca por nome, telefone ou documento
- multiplos contatos
- observacoes

### 6.2 Servicos

- nome do servico
- categoria
- preco base
- duracao estimada
- instrucoes internas

### 6.3 Orcamentos

- itens de servico
- desconto simples
- observacoes
- validade
- envio por link

### 6.4 Ordens de servico

- numero da OS
- cliente vinculado
- endereco do atendimento
- status
- profissional responsavel
- timeline

### 6.5 Agenda

- visualizacao diaria/semanal
- alocacao por profissional
- reagendamento
- observacoes de agenda

### 6.6 Execucao

- check-in/check-out simples
- checklist
- anexos
- observacoes finais
- conclusao

### 6.7 Financeiro

- titulo a receber
- vencimento
- valor
- status de pagamento
- baixa manual

## 7. Riscos do MVP

- querer adicionar financeiro complexo cedo demais
- tentar atender todos os nichos de uma vez
- criar fluxo pesado para usuario individual
- fazer portal demais antes do core funcionar bem

## 8. Decisoes de priorizacao

Prioridade absoluta:

- clientes
- servicos
- orcamentos
- OS
- agenda
- execucao
- cobranca simples

Prioridade secundaria:

- portal
- aceite digital
- notificacoes

## 9. Entrega ideal do MVP para piloto

O MVP deve ser entregue primeiro para:

- 1 autonomo ou MEI
- 1 pequena empresa com 2 a 5 usuarios
- 1 nicho com agenda e cobranca recorrentes

Isso ajuda a validar simplicidade e escalabilidade leve ao mesmo tempo.
