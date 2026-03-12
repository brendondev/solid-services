# Pacote de planejamento - ERP SaaS Multi-tenant

Este diretorio concentra os documentos-base para iniciar o ERP SaaS para prestadores de servicos do zero.

## Conteudo

- `docs/planning/ERP_SaaS_Multi_Planejamento_Completo.md`: documento-mestre com visao, escopo, arquitetura, roadmap, operacao e governanca.
- `docs/planning/ERP_SaaS_Multi_MVP_Detalhado.md`: definicao completa do MVP, escopo, fluxos e criterios de sucesso.
- `docs/planning/ERP_SaaS_Multi_Modulos_Telas_Fluxos.md`: mapa de modulos, navegacao, telas principais e fluxos do produto.
- `docs/planning/ERP_SaaS_Multi_Regras_Negocio.md`: regras funcionais e restricoes de negocio do sistema.
- `docs/planning/ERP_SaaS_Multi_Modelo_Conceitual.md`: entidades e relacionamentos em nivel conceitual.
- `docs/planning/ERP_SaaS_Multi_Precificacao_GTM.md`: estrategia de planos, precificacao e go-to-market.
- `docs/planning/ERP_SaaS_Multi_Backlog_Produto.md`: backlog completo organizado por epicos, features, historias e prioridades.
- `docs/planning/ERP_SaaS_Multi_Especificacao_Telas.md`: especificacao funcional das telas com campos, filtros, acoes e estados.
- `docs/planning/ERP_SaaS_Multi_ICP_Nichos.md`: perfil ideal de cliente, nichos prioritarios e matriz de entrada no mercado.
- `docs/planning/ERP_SaaS_Multi_Roteiro_Entrevistas.md`: roteiro de discovery com perguntas, sinais de aderencia e modelo de registro.
- `docs/planning/ERP_SaaS_Multi_Apresentacao_Executiva.md`: narrativa executiva para pitch, alinhamento com socios e apresentacao do produto.
- `docs/planning/ERP_SaaS_Multi_Script_Comercial.md`: mensagens e roteiro comercial para os primeiros leads.
- `docs/planning/ERP_SaaS_Multi_Proposta_Landing.md`: base textual para proposta comercial curta e landing page.
- `docs/planning/PLANEJAMENTO_GERAL_INDICE.md`: indice consolidado com ordem recomendada de leitura.
- `docs/planning/ERP_SaaS_Multi_Versao_Final_Consolidada.md`: consolidacao final da tese, posicionamento, nicho e uso do pacote.
- `docs/exports/generate-exports.ps1`: script que gera os arquivos de distribuicao (`.docx`, `.pdf`, `.xlsx` e `.csv`) a partir do planejamento.
- `docs/exports/`: pasta de saida dos arquivos exportados.
- `docs/spreadsheets/`: pasta reservada para planilhas auxiliares futuras.

## Saidas geradas

Apos executar o script de exportacao, os arquivos esperados sao:

- `docs/exports/ERP_SaaS_Multi_Planejamento_Completo.docx`
- `docs/exports/ERP_SaaS_Multi_Planejamento_Completo.pdf`
- `docs/exports/ERP_SaaS_Multi_Versao_Final_Consolidada.docx`
- `docs/exports/ERP_SaaS_Multi_Versao_Final_Consolidada.pdf`
- `docs/exports/ERP_SaaS_Multi_Planejamento_Completo.xlsx`
- `docs/exports/ERP_SaaS_Multi_Backlog.csv`

## Uso

Execute:

`C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -ExecutionPolicy Bypass -File docs\exports\generate-exports.ps1`
