'use client';

import { PreviewNotice } from '@/components/common/PreviewNotice';
import { useState } from 'react';
import { Shield, Key, Clock, FileText, AlertTriangle, Save, Loader2, Eye, Download, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function SecuritySettingsPage() {
  const [saving, setSaving] = useState(false);

  // 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // Session settings
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [multipleDevices, setMultipleDevices] = useState(true);

  // Password policy
  const [minPasswordLength, setMinPasswordLength] = useState(8);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireNumbers, setRequireNumbers] = useState(true);
  const [requireSpecialChars, setRequireSpecialChars] = useState(true);
  const [passwordExpireDays, setPasswordExpireDays] = useState(90);

  // Audit
  const [auditLogsEnabled, setAuditLogsEnabled] = useState(true);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      // TODO: Salvar na API
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Configurações de segurança salvas!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const enable2FA = () => {
    setShowQRCode(true);
    toast.success('Escaneie o QR Code com seu app autenticador');
  };

  const downloadAuditLog = () => {
    toast.success('Baixando relatório de auditoria...');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Shield className="w-8 h-8" />
          Segurança
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure políticas de segurança e autenticação
        </p>
      </div>

      <PreviewNotice>
        Esta tela ainda não está ligada ao servidor. O <strong>2FA não é ativado</strong>,
        as políticas não são aplicadas, e a lista de sessões ativas e o histórico
        abaixo são <strong>exemplos fixos</strong> — não refletem acessos reais à
        sua conta.
      </PreviewNotice>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Two-Factor Authentication */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success-subtle  rounded-lg">
                <Key className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Autenticação de Dois Fatores (2FA)</h3>
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => {
                  setTwoFactorEnabled(e.target.checked);
                  if (e.target.checked) enable2FA();
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-primary"></div>
            </label>
          </div>

          {twoFactorEnabled && showQRCode && (
            <div className="pl-11 space-y-4">
              <div className="p-6 bg-muted/50 rounded-lg text-center">
                <div className="w-48 h-48 mx-auto bg-card  rounded-lg flex items-center justify-center mb-4">
                  {/* QR Code placeholder */}
                  <p className="text-sm text-muted-foreground">QR Code</p>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Escaneie este código com Google Authenticator ou Authy
                </p>
                <code className="text-xs bg-muted px-3 py-1 rounded">
                  ABCD-EFGH-IJKL-MNOP
                </code>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Código de Verificação
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="w-full max-w-xs px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-center text-lg tracking-widest"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Digite o código do app para confirmar
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Session Management */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-info-subtle  rounded-lg">
              <Clock className="w-5 h-5 text-info" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Gerenciamento de Sessão</h3>
              <p className="text-sm text-muted-foreground">
                Configure tempo de sessão e dispositivos
              </p>
            </div>
          </div>

          <div className="space-y-4 pl-11">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tempo de Inatividade (minutos)
              </label>
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
                min={5}
                max={480}
                className="w-full max-w-xs px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Deslogar automaticamente após este período de inatividade
              </p>
            </div>

            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
              <div>
                <p className="font-medium">Permitir múltiplos dispositivos</p>
                <p className="text-sm text-muted-foreground">
                  Usuário pode estar logado em vários dispositivos simultaneamente
                </p>
              </div>
              <input
                type="checkbox"
                checked={multipleDevices}
                onChange={(e) => setMultipleDevices(e.target.checked)}
                className="w-4 h-4"
              />
            </label>

            {/* Active Sessions */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Sessões Ativas</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Eye className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Windows • Chrome</p>
                      <p className="text-xs text-muted-foreground">
                        São Paulo, Brasil • Agora
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs bg-success-subtle text-success   rounded">
                    Atual
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Eye className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Android • Chrome Mobile</p>
                      <p className="text-xs text-muted-foreground">
                        São Paulo, Brasil • 2 horas atrás
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1 text-xs text-destructive hover:bg-destructive/10 rounded transition-colors"
                  >
                    Revogar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Policy */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-warning-subtle  rounded-lg">
              <Lock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Política de Senhas</h3>
              <p className="text-sm text-muted-foreground">
                Configure requisitos de senha para todos os usuários
              </p>
            </div>
          </div>

          <div className="space-y-4 pl-11">
            <div>
              <label className="block text-sm font-medium mb-2">
                Comprimento Mínimo
              </label>
              <input
                type="number"
                value={minPasswordLength}
                onChange={(e) => setMinPasswordLength(Number(e.target.value))}
                min={6}
                max={32}
                className="w-full max-w-xs px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
              <span className="font-medium">Exigir letras maiúsculas</span>
              <input
                type="checkbox"
                checked={requireUppercase}
                onChange={(e) => setRequireUppercase(e.target.checked)}
                className="w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
              <span className="font-medium">Exigir números</span>
              <input
                type="checkbox"
                checked={requireNumbers}
                onChange={(e) => setRequireNumbers(e.target.checked)}
                className="w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
              <span className="font-medium">Exigir caracteres especiais</span>
              <input
                type="checkbox"
                checked={requireSpecialChars}
                onChange={(e) => setRequireSpecialChars(e.target.checked)}
                className="w-4 h-4"
              />
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">
                Expiração de Senha (dias)
              </label>
              <input
                type="number"
                value={passwordExpireDays}
                onChange={(e) => setPasswordExpireDays(Number(e.target.value))}
                min={0}
                max={365}
                className="w-full max-w-xs px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                0 = sem expiração
              </p>
            </div>
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Logs de Auditoria</h3>
                <p className="text-sm text-muted-foreground">
                  Registre todas as ações dos usuários
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={auditLogsEnabled}
                onChange={(e) => setAuditLogsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-primary"></div>
            </label>
          </div>

          {auditLogsEnabled && (
            <div className="pl-11 space-y-4">
              <p className="text-sm text-muted-foreground">
                Registros incluem: logins, alterações de dados, exclusões, mudanças de permissão, etc.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={downloadAuditLog}
                  className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Baixar Relatório
                </button>
                <span className="text-sm text-muted-foreground">
                  Últimos 30 dias
                </span>
              </div>

              {/* Recent Logs */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3">Atividades Recentes</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {[
                    { action: 'Login bem-sucedido', user: 'admin@example.com', time: '2 min atrás', type: 'success' },
                    { action: 'Cliente criado: João Silva', user: 'manager@example.com', time: '15 min atrás', type: 'info' },
                    { action: 'Ordem de serviço #1234 finalizada', user: 'tech@example.com', time: '1 hora atrás', type: 'info' },
                    { action: 'Tentativa de login falhou', user: 'unknown@example.com', time: '2 horas atrás', type: 'warning' },
                    { action: 'Usuário removido: teste@example.com', user: 'admin@example.com', time: '3 horas atrás', type: 'danger' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 text-sm bg-muted/30 rounded">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        log.type === 'success' ? 'bg-success' :
                        log.type === 'warning' ? 'bg-warning' :
                        log.type === 'danger' ? 'bg-destructive' : 'bg-info'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.user} • {log.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Warning Banner */}
        <div className="bg-warning-subtle  border border-warning/30  rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-warning  mb-1">
                Importante
              </h4>
              <p className="text-sm text-warning ">
                Alterações nas configurações de segurança afetam todos os usuários do sistema.
                Certifique-se de comunicar mudanças importantes à equipe.
              </p>
            </div>
          </div>
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
