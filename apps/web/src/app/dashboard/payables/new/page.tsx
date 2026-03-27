'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { financialApi } from '@/lib/api/financial';
import { suppliersApi, Supplier } from '@/lib/api/suppliers';
import { ArrowLeft, DollarSign, Loader2 } from 'lucide-react';
import { showToast } from '@/lib/toast';

export default function NewPayablePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [error, setError] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState({
    supplierId: '',
    description: '',
    amount: '',
    dueDate: '',
    category: '',
    notes: '',
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const data = await suppliersApi.findActive();
      setSuppliers(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar fornecedores';
      console.error('Erro ao carregar fornecedores:', err);
      showToast.error(errorMessage);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      await financialApi.createPayable({
        supplierId: formData.supplierId || undefined,
        description: formData.description,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        category: (formData.category as any) || undefined,
        notes: formData.notes || undefined,
      });

      showToast.success('Conta a pagar criada com sucesso');
      router.push('/dashboard/payables');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar conta a pagar';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nova Conta a Pagar</h1>
          <p className="text-muted-foreground mt-1">Registre uma nova despesa</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow border border-border p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="p-3 bg-destructive/10 rounded-lg">
            <DollarSign className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Dados da Despesa</h2>
            <p className="text-sm text-muted-foreground">Preencha as informações abaixo</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: Aluguel - Janeiro/2024"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fornecedor
              </label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card"
                disabled={loadingSuppliers}
              >
                <option value="">Selecione um fornecedor</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              {suppliers.length === 0 && !loadingSuppliers && (
                <p className="text-sm text-muted-foreground mt-1">
                  Nenhum fornecedor cadastrado.{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard/suppliers/new')}
                    className="text-primary hover:underline"
                  >
                    Cadastrar fornecedor
                  </button>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card"
              >
                <option value="">Selecione uma categoria</option>
                <option value="rent">Aluguel</option>
                <option value="utilities">Utilidades</option>
                <option value="supplies">Suprimentos</option>
                <option value="salary">Salário</option>
                <option value="tax">Impostos</option>
                <option value="service">Serviços</option>
                <option value="other">Outros</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vencimento *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Observações sobre a despesa..."
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Conta a Pagar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
