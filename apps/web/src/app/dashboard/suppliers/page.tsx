'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { suppliersApi, Supplier } from '@/lib/api/suppliers';
import { showToast } from '@/lib/toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import type { RelatedLink } from '@/components/common/ConfirmDialog';
import { Plus, Building2, Mail, Phone, FileText, Edit, Trash2, Loader2 } from 'lucide-react';

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorLinks, setDeleteErrorLinks] = useState<RelatedLink[]>([]);

  useEffect(() => {
    loadSuppliers();
  }, [filter]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await suppliersApi.findAll(1, 50, filter || undefined);
      setSuppliers(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar fornecedores');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reason?: string) => {
    if (!deleteDialog.id) return;
    try {
      setIsDeleting(true);
      setDeleteErrorLinks([]);
      await suppliersApi.remove(deleteDialog.id);
      showToast.success('Fornecedor excluído com sucesso');
      setDeleteDialog({ isOpen: false, id: null });
      await loadSuppliers();
    } catch (err: any) {
      const errorData = err.response?.data;
      const errorMessage = typeof errorData === 'string'
        ? errorData
        : errorData?.message || 'Erro ao excluir fornecedor';

      showToast.error(errorMessage);

      // Capturar links de entidades vinculadas
      if (errorData?.links && Array.isArray(errorData.links)) {
        setDeleteErrorLinks(errorData.links);
        setDeleteDialog({ ...deleteDialog, isOpen: true }); // Manter modal aberto
      } else {
        setDeleteDialog({ isOpen: false, id: null });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fornecedores</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus fornecedores e parceiros</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/suppliers/new')}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Novo Fornecedor
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow border border-border">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white min-w-[200px]"
          >
            <option value="">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      </div>

      {/* Suppliers List */}
      {suppliers.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-border p-12 text-center">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-900 mb-2">Nenhum fornecedor encontrado</p>
          <p className="text-muted-foreground mb-6">Cadastre seu primeiro fornecedor</p>
          <button
            onClick={() => router.push('/dashboard/suppliers/new')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Adicionar Primeiro Fornecedor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-white rounded-lg shadow border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{supplier.name}</h3>
                    {supplier.document && (
                      <p className="text-sm text-muted-foreground">{supplier.document}</p>
                    )}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    supplier.status === 'active'
                      ? 'bg-success/10 text-success'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {supplier.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              {(supplier.email || supplier.phone) && (
                <div className="space-y-2 mb-4">
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                </div>
              )}

              {supplier._count && supplier._count.payables > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 pt-4 border-t border-border">
                  <FileText className="w-4 h-4" />
                  <span>{supplier._count.payables} conta(s) a pagar</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <button
                  onClick={() => router.push(`/dashboard/suppliers/${supplier.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => setDeleteDialog({ isOpen: true, id: supplier.id })}
                  className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Excluir Fornecedor"
        message="Tem certeza que deseja excluir este fornecedor?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        requireReason={true}
        reasonLabel="Motivo da exclusão"
        reasonPlaceholder="Informe o motivo para fins de auditoria..."
        isLoading={isDeleting}
        errorLinks={deleteErrorLinks}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
      />
    </div>
  );
}
