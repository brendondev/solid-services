'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { customersApi, Customer, getPrimaryContact } from '@/lib/api/customers';
import { Mail, Phone, ArrowLeft, Loader2 } from 'lucide-react';
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error || 'Cliente não encontrado'}
        </div>
        <button
          onClick={() => router.push('/dashboard/customers')}
          className="min-h-[44px] px-4 py-2 text-primary hover:text-primary/80 hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para clientes
        </button>
      </div>
    );
  }

  const primaryContact = getPrimaryContact(customer);

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
          <button
            onClick={() => router.push('/dashboard/customers')}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground active:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{customer.name}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Detalhes do cliente</p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/dashboard/customers/${id}/edit`)}
          className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:bg-primary/80 font-medium shadow-sm transition-colors"
        >
          Editar
        </button>
      </div>

      {/* Informações Principais */}
      <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">
          Informações Gerais
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs sm:text-sm text-muted-foreground block mb-1">Nome</label>
            <p className="text-sm sm:text-base text-foreground font-medium">{customer.name}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-muted-foreground block mb-1">Tipo</label>
            <p className="text-sm sm:text-base text-foreground font-medium">
              {customer.type === 'company' ? 'Empresa' : 'Pessoa Física'}
            </p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-muted-foreground block mb-1">Email</label>
            <p className="text-sm sm:text-base text-foreground font-medium break-all">{primaryContact.email || '-'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-muted-foreground block mb-1">Telefone</label>
            <p className="text-sm sm:text-base text-foreground font-medium">{primaryContact.phone || '-'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-muted-foreground block mb-1">CPF/CNPJ</label>
            <p className="text-sm sm:text-base text-foreground font-medium">{customer.document || '-'}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-muted-foreground block mb-1">Status</label>
            <p>
              <span
                className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
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
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Contatos</h2>
          <div className="space-y-4">
            {customer.contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b pb-4 last:border-b-0 gap-2"
              >
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-medium text-foreground">
                    {contact.name}
                    {contact.isPrimary && (
                      <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded font-medium">
                        Principal
                      </span>
                    )}
                  </p>
                  {contact.role && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{contact.role}</p>
                  )}
                  <div className="text-xs sm:text-sm text-muted-foreground mt-2 space-y-1">
                    {contact.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="break-all">{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
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
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Endereços</h2>
          <div className="space-y-4">
            {customer.addresses.map((address) => (
              <div
                key={address.id}
                className="border-b pb-4 last:border-b-0"
              >
                <div>
                  {address.isPrimary && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded mb-2 inline-block font-medium">
                      Principal
                    </span>
                  )}
                  <p className="text-sm sm:text-base text-foreground">
                    {address.street}, {address.number}
                    {address.complement && ` - ${address.complement}`}
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {address.district} - {address.city}/{address.state}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">CEP: {address.zipCode}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informações de Sistema */}
      <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">
          Informações do Sistema
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div>
            <label className="text-muted-foreground block mb-1">Criado em</label>
            <p className="text-foreground">
              {new Date(customer.createdAt).toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <label className="text-muted-foreground block mb-1">Última atualização</label>
            <p className="text-foreground">
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
