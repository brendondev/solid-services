import { AlertTriangle } from 'lucide-react';

/**
 * Aviso para telas que ainda são maquete.
 *
 * Existe porque várias telas de Configurações (Segurança, Integrações,
 * Notificações, Backup) não fazem nenhuma chamada de API: os dados exibidos
 * são fixos no código. Sem este aviso, elas passam a impressão de estarem
 * funcionando — o caso mais perigoso era Segurança, que mostrava sessões
 * ativas inventadas e um botão de 2FA que não ativa nada.
 *
 * Ao ligar a tela numa API de verdade, remova o componente do arquivo.
 */
export function PreviewNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
        <div>
          <p className="font-medium text-foreground">Recurso ainda não disponível</p>
          <p className="mt-1 text-sm text-muted-foreground">{children}</p>
        </div>
      </div>
    </div>
  );
}
