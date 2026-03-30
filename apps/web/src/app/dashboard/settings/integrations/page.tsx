'use client';

import { useState } from 'react';
import { Zap, Check, X, ExternalLink, Key, Save, Loader2, MessageCircle, FileText, Webhook } from 'lucide-react';
import toast from 'react-hot-toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  enabled: boolean;
  configured: boolean;
  planRequired?: string;
}

export default function IntegrationsSettingsPage() {
  const [saving, setSaving] = useState(false);

  // WhatsApp
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappToken, setWhatsappToken] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');

  // NFe
  const [nfeEnabled, setNfeEnabled] = useState(false);
  const [nfeCertificate, setNfeCertificate] = useState('');
  const [nfePassword, setNfePassword] = useState('');
  const [nfeEnvironment, setNfeEnvironment] = useState<'production' | 'sandbox'>('sandbox');

  // Webhooks
  const [webhooksEnabled, setWebhooksEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');

  const integrations: Integration[] = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Envie notificações e atualizações via WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30',
      enabled: whatsappEnabled,
      configured: !!whatsappToken && !!whatsappPhone,
      planRequired: 'PRO',
    },
    {
      id: 'nfe',
      name: 'NFe / NFS-e',
      description: 'Emita notas fiscais eletrônicas automaticamente',
      icon: FileText,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
      enabled: nfeEnabled,
      configured: !!nfeCertificate,
      planRequired: 'PRO',
    },
    {
      id: 'webhooks',
      name: 'Webhooks',
      description: 'Integre com sistemas externos via HTTP',
      icon: Webhook,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30',
      enabled: webhooksEnabled,
      configured: !!webhookUrl,
    },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      // TODO: Salvar na API
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Configurações de integrações salvas!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const testWebhook = async () => {
    try {
      toast.loading('Enviando webhook de teste...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.dismiss();
      toast.success('Webhook enviado com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar webhook');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Zap className="w-8 h-8" />
          Integrações
        </h1>
        <p className="text-muted-foreground mt-1">
          Conecte o sistema com serviços externos
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${integration.color}`}>
                <integration.icon className="w-5 h-5" />
              </div>
              {integration.enabled ? (
                <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                  <Check className="w-3 h-3" />
                  Ativo
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 rounded-full">
                  <X className="w-3 h-3" />
                  Inativo
                </span>
              )}
            </div>

            <h3 className="font-semibold mb-1">
              {integration.name}
              {integration.planRequired && (
                <span className="ml-2 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded">
                  {integration.planRequired}
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {integration.description}
            </p>

            {integration.configured ? (
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Configurado
              </p>
            ) : (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Key className="w-3 h-3" />
                Requer configuração
              </p>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* WhatsApp Integration */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  WhatsApp Business API
                  <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded">
                    PRO
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Envie mensagens automáticas para seus clientes
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappEnabled}
                onChange={(e) => setWhatsappEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>

          {whatsappEnabled && (
            <div className="space-y-4 pl-11">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Token de API
                </label>
                <input
                  type="password"
                  value={whatsappToken}
                  onChange={(e) => setWhatsappToken(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Seu token da API do WhatsApp Business"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Número de Telefone
                </label>
                <input
                  type="tel"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="+55 11 99999-9999"
                />
              </div>

              <a
                href="https://business.whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Como obter credenciais do WhatsApp Business
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* NFe Integration */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Nota Fiscal Eletrônica
                  <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded">
                    PRO
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Emita NFe e NFS-e automaticamente
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={nfeEnabled}
                onChange={(e) => setNfeEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>

          {nfeEnabled && (
            <div className="space-y-4 pl-11">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Certificado Digital (A1)
                </label>
                <input
                  type="file"
                  accept=".pfx,.p12"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Faça upload do seu certificado digital .pfx ou .p12
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Senha do Certificado
                </label>
                <input
                  type="password"
                  value={nfePassword}
                  onChange={(e) => setNfePassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Ambiente
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="sandbox"
                      checked={nfeEnvironment === 'sandbox'}
                      onChange={() => setNfeEnvironment('sandbox')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Homologação (Testes)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="production"
                      checked={nfeEnvironment === 'production'}
                      onChange={() => setNfeEnvironment('production')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Produção</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Webhooks */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Webhook className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Webhooks</h3>
                <p className="text-sm text-muted-foreground">
                  Receba eventos em tempo real via HTTP POST
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={webhooksEnabled}
                onChange={(e) => setWebhooksEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>

          {webhooksEnabled && (
            <div className="space-y-4 pl-11">
              <div>
                <label className="block text-sm font-medium mb-2">
                  URL do Webhook
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="https://sua-api.com/webhooks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Secret Key (Opcional)
                </label>
                <input
                  type="password"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Chave secreta para validação"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Usada para assinar as requisições (HMAC-SHA256)
                </p>
              </div>

              <button
                type="button"
                onClick={testWebhook}
                className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                Testar Webhook
              </button>

              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Eventos disponíveis:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <code>order.created</code> - Nova ordem criada</li>
                  <li>• <code>order.status_changed</code> - Status alterado</li>
                  <li>• <code>payment.received</code> - Pagamento recebido</li>
                  <li>• <code>quotation.approved</code> - Orçamento aprovado</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
}
