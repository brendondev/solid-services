'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { financialApi, Payable, PayablePayment } from '@/lib/api/financial';
import {
  ArrowLeft,
  DollarSign,
  Loader2,
  Calendar,
  Building2,
  FileText,
  Clock,
  CheckCircle,
  CreditCard,
  Plus,
} from 'lucide-react';
import { showToast } from '@/lib/toast';

export default function PayableDetailPage() {
  const router = useRouter();
  const params = useParams();
  const payableId = params.id as string;

  const [payable, setPayable] = useState<Payable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'pix',
    paidAt: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    loadPayable();
  }, [payableId]);

  const loadPayable = async () => {
    try {
      setLoading(true);
      const data = await financialApi.findOnePayable(payableId);
      setPayable(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar conta a pagar';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSavingPayment(true);
      await financialApi.registerPayablePayment(payableId, {
        amount: parseFloat(paymentForm.amount),
        method: paymentForm.method as any,
        paidAt: paymentForm.paidAt,
        notes: paymentForm.notes || undefined,
      });

      showToast.success('Pagamento registrado com sucesso');
      setIsPaymentModalOpen(false);
      setPaymentForm({
        amount: '',
        method: 'pix',
        paidAt: new Date().toISOString().split('T')[0],
        notes: '',
      });

      await loadPayable();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao registrar pagamento';
      showToast.error(errorMessage);
    } finally {
      setSavingPayment(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!payable) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Conta a pagar não encontrada</p>
      </div>
    );
  }

  const remaining = Number(payable.amount) - Number(payable.paidAmount);
  const paymentMethodLabels: Record<string, string> = {
    cash: 'Dinheiro',
    pix: 'PIX',
    bank_transfer: 'Transferência',
    debit_card: 'Cartão de Débito',
    credit_card: 'Cartão de Crédito',
    check: 'Cheque',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <button onClick={() => router.push('/dashboard/payables')} className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Conta a Pagar</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 truncate">{payable.description}</p>
        </div>
        {remaining > 0 && (
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-success text-success-foreground rounded-lg hover:bg-success/90 active:bg-success/80 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Registrar Pagamento</span>
            <span className="sm:hidden">Registrar</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Resumo */}
      <div className="bg-card rounded-lg shadow border border-border p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Valor Total</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{formatCurrency(Number(payable.amount))}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Valor Pago</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-success">{formatCurrency(Number(payable.paidAmount))}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">A Pagar</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-destructive">{formatCurrency(remaining)}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Status</p>
            <div className="flex items-center gap-2 mt-2">
              {payable.status === 'paid' ? (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              ) : (
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
              )}
              <span className="text-base sm:text-lg font-semibold">
                {payable.status === 'paid' ? 'Pago' : payable.status === 'partial' ? 'Parcial' : 'Pendente'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
          {payable.supplier && (
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Fornecedor</p>
                <button
                  onClick={() => router.push(`/dashboard/suppliers/${payable.supplierId}`)}
                  className="text-sm sm:text-base font-medium text-primary hover:text-primary/80 hover:underline transition-colors truncate block w-full text-left"
                >
                  {payable.supplier.name}
                </button>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Vencimento</p>
              <p className="text-sm sm:text-base font-medium text-foreground">
                {new Date(payable.dueDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          {payable.category && (
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Categoria</p>
                <p className="text-sm sm:text-base font-medium text-foreground truncate">{payable.category}</p>
              </div>
            </div>
          )}
        </div>

        {payable.notes && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">Observações</p>
            <p className="text-sm sm:text-base text-foreground">{payable.notes}</p>
          </div>
        )}
      </div>

      {/* Histórico de Pagamentos */}
      <div className="bg-card rounded-lg shadow border border-border p-4 sm:p-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-4">Histórico de Pagamentos</h2>

        {!payable.payments || payable.payments.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm sm:text-base text-muted-foreground">Nenhum pagamento registrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payable.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="p-2 bg-success/10 rounded-lg flex-shrink-0">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-medium text-foreground">{formatCurrency(Number(payment.amount))}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {paymentMethodLabels[payment.method] || payment.method} •{' '}
                      {new Date(payment.paidAt).toLocaleDateString('pt-BR')}
                    </p>
                    {payment.notes && <p className="text-xs sm:text-sm text-muted-foreground mt-1">{payment.notes}</p>}
                  </div>
                </div>
                {payment.registeredUser && (
                  <div className="text-left sm:text-right w-full sm:w-auto flex-shrink-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">Registrado por</p>
                    <p className="text-xs sm:text-sm font-medium text-foreground">{payment.registeredUser.name}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-foreground">Registrar Pagamento</h3>

            <form onSubmit={handleRegisterPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  max={remaining}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full h-11 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base sm:text-sm"
                  placeholder="0,00"
                />
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Valor máximo: {formatCurrency(remaining)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Método *</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full h-11 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-base sm:text-sm"
                >
                  <option value="pix">PIX</option>
                  <option value="bank_transfer">Transferência</option>
                  <option value="cash">Dinheiro</option>
                  <option value="debit_card">Cartão de Débito</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="check">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data do Pagamento *</label>
                <input
                  type="date"
                  required
                  value={paymentForm.paidAt}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paidAt: e.target.value })}
                  className="w-full h-11 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base sm:text-sm resize-none"
                  placeholder="Observações sobre o pagamento..."
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center gap-2 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="w-full sm:flex-1 min-h-[44px] px-4 sm:px-6 py-2 sm:py-3 border border-border rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingPayment}
                  className="w-full sm:flex-1 min-h-[44px] flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-success text-success-foreground rounded-lg hover:bg-success/90 active:bg-success/80 transition-colors font-medium disabled:opacity-50"
                >
                  {savingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Confirmar Pagamento</span>
                      <span className="sm:hidden">Confirmar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
