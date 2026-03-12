# Regras de negocio - ERP SaaS para prestadores de servicos

## 1. Regras gerais

- todo dado pertence a um tenant
- cada usuario acessa apenas o que seu perfil permite
- orcamento pode ou nao virar OS
- OS pode nascer diretamente, sem orcamento, conforme regra do tenant
- todo recebimento deve estar ligado a uma origem identificavel

## 2. Regras de clientes

- cliente pode ter mais de um contato
- cliente pode ter mais de um endereco
- cliente pode ter servicos, OS e cobrancas no historico
- cliente inativo nao deve sumir do historico

## 3. Regras de servicos

- servico pode ter valor base e duracao estimada
- servico pode ter checklist padrao
- servico pode ser ativo ou inativo
- servico inativo nao deve aparecer para novos lancamentos

## 4. Regras de orcamento

- orcamento deve ter status definido
- status sugeridos: rascunho, enviado, aprovado, recusado, vencido
- orcamento aprovado pode gerar OS
- orcamento vencido pode ser reaberto ou duplicado
- historico de alteracoes importantes deve ser rastreado

## 5. Regras de OS

- OS deve ter cliente obrigatorio
- OS deve ter ao menos um tipo de servico associado
- OS deve ter status operacional
- status sugeridos: aberta, agendada, em_execucao, aguardando, concluida, cancelada
- OS concluida nao deve ser editada livremente sem permissao especial

## 6. Regras de agenda

- um compromisso deve ter data/hora prevista
- pode existir profissional responsavel
- reagendamentos devem ficar registrados
- servico atrasado deve aparecer em destaque

## 7. Regras de execucao

- conclusao pode exigir checklist final
- anexos devem ficar vinculados a cliente e OS
- comprovante final pode ser compartilhado com o cliente
- aceite de conclusao pode ser opcional por tenant

## 8. Regras financeiras

- todo recebivel precisa de valor, vencimento e status
- status sugeridos: pendente, parcial, pago, vencido, cancelado
- pagamento parcial deve atualizar saldo em aberto
- baixa manual deve registrar usuario e data

## 9. Regras do portal do cliente

- cliente deve acessar apenas seus proprios dados
- portal pode exibir orcamentos, OS, comprovantes e pagamentos
- aprovacao por link deve ter validade e rastreabilidade

## 10. Regras de auditoria

Eventos criticos que devem ser auditados:

- criacao e edicao de clientes
- aprovacao/recusa de orcamentos
- alteracao de status de OS
- registro de pagamento
- alteracao de permissoes

## 11. Regras de configuracao por nicho

- tenant pode habilitar campos adicionais
- tenant pode escolher templates de checklist
- tenant pode adaptar nomenclaturas sem quebrar o core

## 12. Regras de crescimento do produto

- nova feature so entra se melhorar o fluxo principal ou abrir oportunidade clara de monetizacao
- customizacao especifica deve virar configuracao reutilizavel sempre que possivel
