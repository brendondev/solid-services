'use client';

import { useState } from 'react';
import { Bell, Mail, MessageSquare, Save, Loader2, Volume2, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsSettingsPage() {
  const [saving, setSaving] = useState(false);

  // Email notifications
  const [emailNewOrder, setEmailNewOrder] = useState(true);
  const [emailOrderStatusChange, setEmailOrderStatusChange] = useState(true);
  const [emailNewQuotation, setEmailNewQuotation] = useState(true);
  const [emailPaymentReceived, setEmailPaymentReceived] = useState(true);
  const [emailPaymentOverdue, setEmailPaymentOverdue] = useState(true);
  const [emailNewCustomer, setEmailNewCustomer] = useState(false);
  const [emailWeeklySummary, setEmailWeeklySummary] = useState(true);

  // Push notifications
  const [pushNewOrder, setPushNewOrder] = useState(true);
  const [pushOrderStatusChange, setPushOrderStatusChange] = useState(true);
  const [pushPaymentReceived, setPushPaymentReceived] = useState(true);
  const [pushScheduleReminder, setPushScheduleReminder] = useState(true);

  // Sound notifications
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(70);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      // TODO: Salvar na API
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Configurações de notificações salvas!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Bell className="w-8 h-8" />
          Notificações
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure como e quando você deseja receber notificações
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Email Notifications */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Notificações por Email</h3>
              <p className="text-sm text-muted-foreground">
                Receba alertas importantes no seu email
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Ordens de Serviço */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase">
                Ordens de Serviço
              </h4>

              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Nova ordem de serviço</p>
                    <p className="text-sm text-muted-foreground">
                      Quando uma nova OS é criada
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailNewOrder}
                  onChange={(e) => setEmailNewOrder(e.target.checked)}
                  className="w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Mudança de status</p>
                    <p className="text-sm text-muted-foreground">
                      Quando o status de uma OS muda
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailOrderStatusChange}
                  onChange={(e) => setEmailOrderStatusChange(e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
            </div>

            <div className="border-t border-border"></div>

            {/* Orçamentos */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase">
                Orçamentos
              </h4>

              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Novo orçamento</p>
                    <p className="text-sm text-muted-foreground">
                      Quando um novo orçamento é criado
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailNewQuotation}
                  onChange={(e) => setEmailNewQuotation(e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
            </div>

            <div className="border-t border-border"></div>

            {/* Financeiro */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase">
                Financeiro
              </h4>

              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="font-medium">Pagamento recebido</p>
                    <p className="text-sm text-muted-foreground">
                      Quando um pagamento é confirmado
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailPaymentReceived}
                  onChange={(e) => setEmailPaymentReceived(e.target.checked)}
                  className="w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <div>
                    <p className="font-medium">Pagamento atrasado</p>
                    <p className="text-sm text-muted-foreground">
                      Quando um pagamento está vencido
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailPaymentOverdue}
                  onChange={(e) => setEmailPaymentOverdue(e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
            </div>

            <div className="border-t border-border"></div>

            {/* Outros */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase">
                Outros
              </h4>

              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Novo cliente cadastrado</p>
                    <p className="text-sm text-muted-foreground">
                      Quando um cliente é adicionado
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailNewCustomer}
                  onChange={(e) => setEmailNewCustomer(e.target.checked)}
                  className="w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Resumo semanal</p>
                    <p className="text-sm text-muted-foreground">
                      Relatório semanal toda segunda-feira
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailWeeklySummary}
                  onChange={(e) => setEmailWeeklySummary(e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Notificações Push</h3>
              <p className="text-sm text-muted-foreground">
                Alertas instantâneos no navegador
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
              <div>
                <p className="font-medium">Nova ordem de serviço</p>
                <p className="text-sm text-muted-foreground">
                  Alerta instantâneo quando uma OS é criada
                </p>
              </div>
              <input
                type="checkbox"
                checked={pushNewOrder}
                onChange={(e) => setPushNewOrder(e.target.checked)}
                className="w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
              <div>
                <p className="font-medium">Mudança de status</p>
                <p className="text-sm text-muted-foreground">
                  Quando o status de uma OS muda
                </p>
              </div>
              <input
                type="checkbox"
                checked={pushOrderStatusChange}
                onChange={(e) => setPushOrderStatusChange(e.target.checked)}
                className="w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
              <div>
                <p className="font-medium">Pagamento recebido</p>
                <p className="text-sm text-muted-foreground">
                  Notificação quando pagamento é confirmado
                </p>
              </div>
              <input
                type="checkbox"
                checked={pushPaymentReceived}
                onChange={(e) => setPushPaymentReceived(e.target.checked)}
                className="w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
              <div>
                <p className="font-medium">Lembretes de agenda</p>
                <p className="text-sm text-muted-foreground">
                  15 minutos antes de compromissos
                </p>
              </div>
              <input
                type="checkbox"
                checked={pushScheduleReminder}
                onChange={(e) => setPushScheduleReminder(e.target.checked)}
                className="w-4 h-4"
              />
            </label>
          </div>
        </div>

        {/* Sound Settings */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Volume2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Sons</h3>
              <p className="text-sm text-muted-foreground">
                Configure alertas sonoros
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
              <div>
                <p className="font-medium">Ativar sons de notificação</p>
                <p className="text-sm text-muted-foreground">
                  Tocar som quando receber notificações
                </p>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4"
              />
            </label>

            {soundEnabled && (
              <div className="pl-3">
                <label className="block text-sm font-medium mb-2">
                  Volume: {soundVolume}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Restaurar Padrão
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
