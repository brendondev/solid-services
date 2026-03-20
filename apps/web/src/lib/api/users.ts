import api from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password?: string;
  roles: string[];
}

export interface UpdateUserDto {
  name?: string;
  roles?: string[];
  status?: 'active' | 'inactive';
}

export interface InviteUserDto {
  email: string;
  roles: string[];
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/**
 * API de gerenciamento de usuários
 */
export const usersApi = {
  /**
   * Lista todos os usuários do tenant
   */
  async findAll(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  /**
   * Busca usuário por ID
   */
  async findOne(id: string): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  /**
   * Cria novo usuário
   */
  async create(dto: CreateUserDto): Promise<User & { tempPassword?: string }> {
    const { data } = await api.post<User & { tempPassword?: string }>('/users', dto);
    return data;
  },

  /**
   * Convida novo usuário (gera senha temporária)
   */
  async invite(dto: InviteUserDto): Promise<User & { tempPassword: string; message: string }> {
    const { data } = await api.post<User & { tempPassword: string; message: string }>(
      '/users/invite',
      dto,
    );
    return data;
  },

  /**
   * Atualiza usuário
   */
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const { data} = await api.patch<User>(`/users/${id}`, dto);
    return data;
  },

  /**
   * Remove usuário
   */
  async remove(id: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/users/${id}`);
    return data;
  },

  /**
   * Muda própria senha
   */
  async changePassword(dto: ChangePasswordDto): Promise<{ message: string }> {
    const { data } = await api.patch<{ message: string }>('/users/me/change-password', dto);
    return data;
  },

  /**
   * Reseta senha de usuário (admin only)
   */
  async resetPassword(id: string): Promise<{ message: string; tempPassword: string }> {
    const { data } = await api.post<{ message: string; tempPassword: string }>(
      `/users/${id}/reset-password`,
    );
    return data;
  },
};
