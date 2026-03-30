'use client';

import { useEffect, useState } from 'react';
import { usersApi, User } from '@/lib/api/users';
import { UserPlus, Edit2, Trash2, RefreshCw, Shield, Eye } from 'lucide-react';
import InviteUserModal from '@/components/users/InviteUserModal';
import EditUserModal from '@/components/users/EditUserModal';

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  technician: 'Técnico',
  viewer: 'Visualizador',
};

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-blue-100 text-blue-800',
  technician: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resettingPassword, setResettingPassword] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await usersApi.findAll();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSuccess = () => {
    setShowInviteModal(false);
    loadUsers();
  };

  const handleEditSuccess = () => {
    setEditingUser(null);
    loadUsers();
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Tem certeza que deseja remover o usuário ${user.name}?`)) {
      return;
    }

    try {
      await usersApi.remove(user.id);
      alert('Usuário removido com sucesso!');
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao remover usuário');
    }
  };

  const handleResetPassword = async (user: User) => {
    if (!confirm(`Resetar senha de ${user.name}? Uma senha temporária será gerada.`)) {
      return;
    }

    try {
      setResettingPassword(user.id);
      const result = await usersApi.resetPassword(user.id);
      alert(
        `Senha resetada com sucesso!\n\nSenha temporária: ${result.tempPassword}\n\nCompartilhe com o usuário.`,
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao resetar senha');
    } finally {
      setResettingPassword(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os usuários e permissões do sistema
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <UserPlus className="w-4 h-4" />
          Convidar Usuário
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Sobre Permissões</h3>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>
                <strong>Administrador:</strong> Acesso total, incluindo gerenciar
                usuários
              </li>
              <li>
                <strong>Gerente:</strong> Gerenciar clientes, orçamentos e ordens
              </li>
              <li>
                <strong>Técnico:</strong> Executar ordens de serviço e ver agenda
              </li>
              <li>
                <strong>Visualizador:</strong> Apenas visualizar informações
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissões
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Criado em
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-foreground">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className={`px-2 py-1 text-xs rounded-full font-medium ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}
                        >
                          {roleLabels[role] || role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user)}
                        disabled={resettingPassword === user.id}
                        className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                        title="Resetar senha"
                      >
                        <RefreshCw
                          className={`w-4 h-4 ${resettingPassword === user.id ? 'animate-spin' : ''}`}
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-red-600 hover:text-red-900"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg shadow">
          <div className="text-sm text-muted-foreground">Total de Usuários</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {users.length}
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg shadow">
          <div className="text-sm text-muted-foreground">Ativos</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {users.filter((u) => u.status === 'active').length}
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg shadow">
          <div className="text-sm text-muted-foreground">Administradores</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {users.filter((u) => u.roles.includes('admin')).length}
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg shadow">
          <div className="text-sm text-muted-foreground">Técnicos</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {users.filter((u) => u.roles.includes('technician')).length}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
