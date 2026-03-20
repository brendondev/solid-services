'use client';

import { useState } from 'react';
import { usersApi, InviteUserDto } from '@/lib/api/users';
import { X, UserPlus, Copy, Check } from 'lucide-react';

interface InviteUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const roles = [
  { value: 'admin', label: 'Administrador', description: 'Acesso total ao sistema' },
  {
    value: 'manager',
    label: 'Gerente',
    description: 'Gerenciar clientes, orçamentos e OS',
  },
  {
    value: 'technician',
    label: 'Técnico',
    description: 'Executar ordens de serviço',
  },
  { value: 'viewer', label: 'Visualizador', description: 'Apenas visualizar' },
];

export default function InviteUserModal({ onClose, onSuccess }: InviteUserModalProps) {
  const [email, setEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['viewer']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ tempPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email é obrigatório');
      return;
    }

    if (selectedRoles.length === 0) {
      setError('Selecione pelo menos uma permissão');
      return;
    }

    try {
      setLoading(true);
      const dto: InviteUserDto = {
        email,
        roles: selectedRoles,
      };

      const result = await usersApi.invite(dto);
      setSuccess({ tempPassword: result.tempPassword });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao convidar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = async () => {
    if (success?.tempPassword) {
      await navigator.clipboard.writeText(success.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Success Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Usuário Convidado!</h2>
            </div>
            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Content */}
          <div className="space-y-4">
            <p className="text-gray-700">
              Usuário <strong>{email}</strong> foi convidado com sucesso!
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-yellow-900 mb-2">
                Senha Temporária:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border border-yellow-300 text-yellow-900 font-mono text-sm">
                  {success.tempPassword}
                </code>
                <button
                  onClick={handleCopyPassword}
                  className={`p-2 rounded transition-colors ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300'
                  }`}
                  title="Copiar senha"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-yellow-800 mt-2">
                Compartilhe esta senha com o usuário. Ele deverá alterá-la no primeiro
                acesso.
              </p>
            </div>

            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Convidar Usuário</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email do Usuário *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@empresa.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              required
            />
          </div>

          {/* Roles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permissões *
            </label>
            <div className="space-y-2">
              {roles.map((role) => (
                <label
                  key={role.value}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.value)}
                    onChange={() => toggleRole(role.value)}
                    className="mt-1"
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{role.label}</div>
                    <div className="text-sm text-gray-600">{role.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-800">
              <strong>Importante:</strong> Uma senha temporária será gerada
              automaticamente. O usuário deverá alterá-la no primeiro acesso.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Convidando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Convidar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
