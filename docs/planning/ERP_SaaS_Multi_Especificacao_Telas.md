# Especificacao de telas - ERP SaaS para prestadores de servicos

## 1. Objetivo

Este documento detalha as principais telas do produto em nivel funcional, com foco em campos, acoes, filtros, estados e comportamento esperado.

## 2. Padrões gerais de interface

### 2.1 Regras gerais

- a interface deve ser simples para usuarios nao tecnicos
- o fluxo principal deve exigir poucos cliques
- a navegação deve priorizar uso diario
- o sistema deve funcionar bem em desktop e mobile
- acoes principais devem ser sempre visiveis

### 2.2 Elementos recorrentes

- busca global
- filtros rapidos
- botao principal de criar
- status visivel por cor ou etiqueta
- timeline em telas operacionais
- cards/resumos no dashboard

## 3. Tela: Login

### Objetivo

Permitir acesso rapido e simples ao sistema.

### Campos

- e-mail
- senha

### Acoes

- entrar
- recuperar senha

### Estados

- carregando
- credenciais invalidas
- usuario sem acesso

## 4. Tela: Dashboard

### Objetivo

Mostrar uma visao geral do negocio e destacar prioridades do dia.

### Blocos principais

- servicos de hoje
- OS em aberto
- OS atrasadas
- orcamentos pendentes
- recebimentos pendentes
- agenda do dia
- alertas

### Filtros

- hoje
- semana
- mes
- por profissional

### Acoes

- criar cliente
- criar orcamento
- criar OS
- abrir agenda
- abrir financeiro

### Estados

- sem dados iniciais
- dados carregados
- alertas criticos

## 5. Tela: Lista de clientes

### Objetivo

Permitir localizar, criar e gerenciar clientes com rapidez.

### Campos visiveis na lista

- nome
- telefone principal
- cidade/bairro
- ultimo atendimento
- total de OS
- status

### Filtros

- ativo/inativo
- com OS em aberto
- com orcamentos pendentes
- com inadimplencia

### Busca

- nome
- telefone
- documento

### Acoes

- novo cliente
- abrir ficha
- editar
- inativar

### Estados

- lista vazia
- resultado sem correspondencia
- cliente inativo

## 6. Tela: Ficha do cliente

### Objetivo

Centralizar todo o historico do cliente.

### Blocos

- dados principais
- contatos
- enderecos
- observacoes
- historico

### Abas

- resumo
- orcamentos
- OS
- financeiro
- anexos

### Campos principais

- nome/razao social
- CPF/CNPJ
- telefone
- e-mail
- endereco principal
- observacoes internas

### Acoes

- editar cliente
- novo orcamento
- nova OS
- registrar observacao

### Estados

- cliente sem historico
- cliente com pendencias financeiras
- cliente inativo

## 7. Tela: Catalogo de servicos

### Objetivo

Padronizar os servicos ofertados.

### Campos da lista

- nome do servico
- categoria
- preco base
- duracao estimada
- status

### Campos do cadastro

- nome
- categoria
- descricao
- valor base
- duracao estimada
- instrucoes internas
- checklist sugerido

### Acoes

- novo servico
- editar
- duplicar
- ativar/inativar

### Estados

- servico ativo
- servico inativo
- sem servicos cadastrados

## 8. Tela: Orcamentos

### Objetivo

Criar, acompanhar e aprovar propostas.

### Lista de orcamentos

Campos:

- numero
- cliente
- valor total
- data
- validade
- status

Filtros:

- rascunho
- enviado
- aprovado
- recusado
- vencido

Busca:

- numero
- cliente

Acoes:

- novo orcamento
- editar
- enviar link
- duplicar
- converter em OS

### Formulario de orcamento

Campos:

- cliente
- endereco de atendimento
- itens de servico
- desconto
- observacoes
- validade
- condicoes

### Estados

- rascunho
- enviado
- aprovado
- recusado
- vencido

## 9. Tela: Lista de ordens de servico

### Objetivo

Controlar a operacao em andamento.

### Campos visiveis

- numero da OS
- cliente
- servico principal
- profissional
- data agendada
- status
- prioridade

### Filtros

- aberta
- agendada
- em execucao
- aguardando
- concluida
- cancelada
- por profissional
- por periodo

### Acoes

- nova OS
- abrir detalhe
- reagendar
- alterar status

### Estados

- sem OS
- OS atrasada
- OS concluida

## 10. Tela: Detalhe da OS

### Objetivo

Reunir todas as informacoes do servico em execucao.

### Blocos principais

- cabecalho
- timeline
- dados do cliente
- servicos/itens
- agenda
- checklist
- anexos
- observacoes internas
- conclusao
- cobranca

### Campos do cabecalho

- numero da OS
- cliente
- endereco
- profissional responsavel
- status
- prioridade
- data prevista

### Acoes

- editar OS
- alterar status
- registrar check-in
- registrar check-out
- anexar arquivo
- concluir OS
- gerar cobranca

### Estados

- aberta
- agendada
- em execucao
- aguardando retorno
- concluida
- cancelada

## 11. Tela: Agenda

### Objetivo

Organizar compromissos e execucao.

### Visoes

- diaria
- semanal
- por profissional

### Campos do compromisso

- cliente
- OS vinculada
- servico
- data/hora
- profissional
- observacao
- status

### Filtros

- hoje
- semana
- profissional
- status

### Acoes

- agendar
- reagendar
- confirmar
- marcar como em execucao
- marcar como concluido

### Estados

- agendado
- confirmado
- em execucao
- concluido
- atrasado
- cancelado

## 12. Tela: Checklist e execucao

### Objetivo

Registrar a execucao do servico de maneira simples.

### Elementos

- checklist do servico
- campos livres
- anexos
- observacoes finais
- aceite de conclusao

### Acoes

- marcar item concluido
- adicionar observacao
- anexar foto/documento
- finalizar atendimento

### Estados

- em preenchimento
- incompleto
- concluido

## 13. Tela: Financeiro - Contas a receber

### Objetivo

Controlar valores que precisam ser recebidos.

### Campos visiveis

- cliente
- origem
- vencimento
- valor total
- valor em aberto
- status

### Filtros

- pendente
- parcial
- pago
- vencido
- periodo

### Acoes

- novo recebivel
- registrar pagamento
- enviar cobranca
- gerar link de pagamento

### Estados

- pendente
- parcial
- pago
- vencido
- cancelado

## 14. Tela: Pagamento/baixa

### Objetivo

Registrar o recebimento de um titulo.

### Campos

- recebivel
- valor pago
- data do pagamento
- metodo
- observacoes

### Acoes

- confirmar pagamento
- cancelar operacao

### Estados

- pagamento parcial
- pagamento total
- erro de validacao

## 15. Tela: Portal do cliente

### Objetivo

Dar transparencia e autonomia ao cliente final.

### Seções

- meus orcamentos
- meus servicos
- meus pagamentos
- meus documentos

### Acoes

- aprovar orcamento
- recusar orcamento
- pagar
- baixar comprovante
- consultar historico

### Estados

- pendente de aprovacao
- servico em andamento
- pagamento pendente
- concluido

## 16. Tela: Usuarios e permissoes

### Objetivo

Gerenciar equipe e acessos.

### Campos

- nome
- e-mail
- perfil
- status

### Acoes

- convidar usuario
- editar perfil
- ativar/inativar

### Estados

- convite pendente
- usuario ativo
- usuario inativo

## 17. Tela: Configuracoes

### Objetivo

Permitir ajustes basicos do tenant.

### Secoes

- dados da empresa
- identidade visual
- preferencias operacionais
- templates
- notificacoes

### Acoes

- salvar configuracoes
- testar template
- ativar/desativar recurso

## 18. Prioridade de detalhamento

### Prioridade 1

- dashboard
- clientes
- ficha do cliente
- servicos
- orcamentos
- lista de OS
- detalhe da OS
- agenda
- contas a receber

### Prioridade 2

- checklist/execucao
- portal do cliente
- usuarios/permissoes
- configuracoes

## 19. Proximo nivel de aprofundamento

Depois desta etapa, cada tela pode evoluir para:

- wireframe
- fluxo de clique
- validacoes
- estados vazios
- microcopys
