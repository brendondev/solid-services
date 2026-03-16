'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { customersApi, Customer, getPrimaryContact } from '@/lib/api/customers';
import {
  Plus,
  Users,
  Building2,
  User,
  Eye,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Mail,
  Phone
} from 'lucide-react';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadCustomers();
  }, [filter]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = filter
        ? await customersApi.findAll(filter)
        : await customersApi.findAll();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar clientes');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    try {
      await customersApi.remove(id);
      await loadCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir cliente');
    }
  };

  const getStats = () => {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'active').length;
    const companies = customers.filter(c => c.type === 'company').length;
    const individuals = customers.filter(c => c.type === 'individual').length;

    return { total, active, companies, individuals };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie sua base de clientes</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/customers/new')}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Clientes Ativos</p>
              <p className="text-2xl font-bold text-success mt-1">{stats.active}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Empresas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.companies}</p>
            </div>
            <div className="p-3 bg-accent rounded-lg">
              <Building2 className="w-6 h-6 text-accent-foreground" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pessoas Físicas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.individuals}</p>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <User className="w-6 h-6 text-secondary-foreground" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-border">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white min-w-[200px]"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      </div>

      {/* Customers List */}
      {customers.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-border p-12 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-900 mb-2">Nenhum cliente encontrado</p>
          <p className="text-muted-foreground mb-6">Comece adicionando seu primeiro cliente</p>
          <button
            onClick={() => router.push('/dashboard/customers/new')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Adicionar Primeiro Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {customers.map((customer) => {
            const primaryContact = getPrimaryContact(customer);
            return (
            <div
              key={customer.id}
              className="bg-white rounded-lg shadow border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {customer.type === 'company' ? (
                        <Building2 className="w-5 h-5 text-primary" />
                      ) : (
                        <User className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {customer.name}
                      </h3>
                      {customer.document && (
                        <p className="text-sm text-muted-foreground">{customer.document}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      customer.type === 'company'
                        ? 'bg-accent/10 text-accent border-accent/20'
                        : 'bg-primary/10 text-primary border-primary/20'
                    }`}>
                      {customer.type === 'company' ? 'Empresa' : 'Pessoa Física'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${
                      customer.status === 'active'
                        ? 'bg-success/10 text-success border-success/20'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {customer.status === 'active' ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Ativo
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          Inativo
                        </>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {primaryContact.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-gray-900">{primaryContact.email}</span>
                      </div>
                    )}
                    {primaryContact.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-gray-900">{primaryContact.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/customers/${customer.id}/edit`)}
                    className="p-2 text-warning hover:bg-warning/10 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
