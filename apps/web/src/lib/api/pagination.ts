/**
 * Limite usado pelos métodos `findAll*`, que carregam a coleção inteira para
 * filtrar e ordenar no cliente.
 *
 * A API pagina em 10 registros por padrão. Sem passar um limite explícito, os
 * `findAll` devolviam apenas a primeira página — e como as telas calculam os
 * totais em cima do array recebido, a contagem exibida ficava errada (a tela
 * de clientes mostrava "Total de Clientes: 10" com 26 no banco).
 *
 * É um teto pragmático, não uma solução definitiva: quando um tenant passar
 * disso, o caminho certo é paginar no servidor e pedir os totais agregados à
 * API, em vez de trazer tudo para o navegador.
 */
export const PAGE_LIMIT_ALL = 1000;
