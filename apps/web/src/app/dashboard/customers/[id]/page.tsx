'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { customersApi, Customer, getPrimaryContact } from '@/lib/api/customers';
import { Mail, Phone } from 'lucide-react';
import PortalAccessCard from '@/components/customers/PortalAccessCard';

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadCustomer();
    }
  }, [id]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const data = await customersApi.findOne(id);
      setCustomer(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar cliente');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando cliente...</div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error || 'Cliente não encontrado'}
        </div>
        <button
          onClick={() => router.push('/dashboard/customers')}
          className="text-primary hover:text-primary/80 hover:underline"
        >
          ← Voltar para clientes
        </button>
      </div>
    );
  }

  const primaryContact = getPrimaryContact(customer);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/dashboard/customers')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Voltar
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-600">Detalhes do cliente</p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/dashboard/customers/${id}/edit`)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium shadow-sm transition-colors"
        >
          Editar
        </button>
      </div>

      {/* Informações Principais */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Informações Gerais
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Nome</label>
            <p className="text-gray-900 font-medium">{customer.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Tipo</label>
            <p className="text-gray-900 font-medium">
              {customer.type === 'company' ? 'Empresa' : 'Pessoa Física'}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <p className="text-gray-900 font-medium">{primaryContact.email || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Telefone</label>
            <p className="text-gray-900 font-medium">{primaryContact.phone || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">CPF/CNPJ</label>
            <p className="text-gray-900 font-medium">{customer.document || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Status</label>
            <p>
              <span
                className={`px-2 py-1 text-xs rounded-full font-medium ${
                  customer.status === 'active'
                    ? 'bg-success/10 text-success'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {customer.status === 'active' ? 'Ativo' : 'Inativo'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Contatos */}
      {customer.contacts && customer.contacts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contatos</h2>
          <div className="space-y-3">
            {customer.contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-start justify-between border-b pb-3 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {contact.name}
                    {contact.isPrimary && (
                      <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded font-medium">
                        Principal
                      </span>
                    )}
                  </p>
                  {contact.role && (
                    <p className="text-sm text-gray-600">{contact.role}</p>
                  )}
                  <div className="text-sm text-muted-foreground mt-1 space-y-1">
                    {contact.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Endereços */}
      {customer.addresses && customer.addresses.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Endereços</h2>
          <div className="space-y-4">
            {customer.addresses.map((address) => (
              <div
                key={address.id}
                className="border-b pb-4 last:border-b-0"
              >
                <div className="flex items-start justify-between">
                  <div>
                    {address.isPrimary && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded mb-2 inline-block font-medium">
                        Principal
                      </span>
                    )}
                    <p className="text-gray-900">
                      {address.street}, {address.number}
                      {address.complement && ` - ${address.complement}`}
                    </p>
                    <p className="text-gray-600">
                      {address.neighborhood} - {address.city}/{address.state}
                    </p>
                    <p className="text-sm text-gray-500">CEP: {address.zipCode}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informações de Sistema */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Informações do Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-gray-600">Criado em</label>
            <p className="text-gray-900">
              {new Date(customer.createdAt).toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <label className="text-gray-600">Última atualização</label>
            <p className="text-gray-900">
              {new Date(customer.updatedAt).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      {/* Portal do Cliente */}
      <PortalAccessCard customerId={id} />
    </div>
  );
}
