'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/contexts/ToastContext';
import { financialApi } from '@/lib/api/financial';

const paymentSchema = z.object({
  amount: z.string().refine((val) => parseFloat(val) > 0, {
    message: 'Valor deve ser maior que zero',
  }),
  method: z.enum(['cash', 'pix', 'credit_card', 'debit_card', 'bank_transfer', 'other'], {
    required_error: 'Selecione um método de pagamento',
  }),
  paidAt: z.string().min(1, 'Data do pagamento é obrigatória'),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface Receivable {
  id: string;
  amount: number;
  paidAmount: number;
  customer?: {
    name: string;
  };
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  receivable: Receivable | null;
  onSuccess: () => void;
}

const paymentMethodOptions = [
  { value: 'cash', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'bank_transfer', label: 'Transferência Bancária' },
  { value: 'other', label: 'Outro' },
];

export function PaymentModal({ isOpen, onClose, receivable, onSuccess }: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const amountWatch = watch('amount');
  const remainingAmount = receivable
    ? receivable.amount - receivable.paidAmount
    : 0;

  const onSubmit = async (data: PaymentFormData) => {
    if (!receivable) return;

    const paymentAmount = parseFloat(data.amount);

    if (paymentAmount > remainingAmount) {
      toast.error('O valor do pagamento não pode ser maior que o saldo devedor');
      return;
    }

    try {
      setIsLoading(true);

      await financialApi.registerPayment(receivable.id, {
        amount: paymentAmount,
        method: data.method,
        paidAt: new Date(data.paidAt).toISOString(),
        notes: data.notes,
      });

      toast.success('Pagamento registrado com sucesso');
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao registrar pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!receivable) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader onClose={handleClose}>
          Registrar Pagamento
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            {/* Info do recebível */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Cliente:</span>
                  <p className="font-medium text-gray-900">{receivable.customer?.name || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Valor total:</span>
                  <p className="font-medium text-gray-900">
                    {receivable.amount.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Já pago:</span>
                  <p className="font-medium text-gray-900">
                    {receivable.paidAmount.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Saldo devedor:</span>
                  <p className="font-semibold text-blue-600">
                    {remainingAmount.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Formulário de pagamento */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register('amount')}
                type="number"
                step="0.01"
                label="Valor do pagamento"
                placeholder="0,00"
                error={errors.amount?.message}
                required
              />

              <Select
                {...register('method')}
                label="Método de pagamento"
                options={paymentMethodOptions}
                placeholder="Selecione..."
                error={errors.method?.message}
                required
              />
            </div>

            <Input
              {...register('paidAt')}
              type="datetime-local"
              label="Data e hora do pagamento"
              error={errors.paidAt?.message}
              required
            />

            <Input
              {...register('notes')}
              type="text"
              label="Observações"
              placeholder="Informações adicionais (opcional)"
              error={errors.notes?.message}
            />

            {/* Validação visual */}
            {amountWatch && parseFloat(amountWatch) > 0 && (
              <div className={`p-3 rounded-lg text-sm ${
                parseFloat(amountWatch) > remainingAmount
                  ? 'bg-red-50 text-red-800'
                  : 'bg-blue-50 text-blue-800'
              }`}>
                {parseFloat(amountWatch) > remainingAmount ? (
                  <>
                    <strong>Atenção:</strong> O valor do pagamento excede o saldo devedor.
                  </>
                ) : parseFloat(amountWatch) === remainingAmount ? (
                  <>
                    <strong>Quitação total:</strong> Este pagamento quitará o recebível.
                  </>
                ) : (
                  <>
                    <strong>Pagamento parcial:</strong> Restará{' '}
                    {(remainingAmount - parseFloat(amountWatch)).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </>
                )}
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Registrar Pagamento
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
