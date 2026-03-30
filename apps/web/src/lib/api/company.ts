import api from './client';

export interface CompanyData {
  id: string;
  name: string;
  logo?: string;
  companyName?: string;
  tradingName?: string;
  document?: string;
  email?: string;
  phone?: string;
  website?: string;
  // Endereço
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  // Dados fiscais
  stateRegistration?: string;
  municipalRegistration?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCompanyDto {
  logo?: string;
  companyName?: string;
  tradingName?: string;
  document?: string;
  email?: string;
  phone?: string;
  website?: string;
  // Endereço
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  // Dados fiscais
  stateRegistration?: string;
  municipalRegistration?: string;
}

export const companyApi = {
  /**
   * Buscar dados da empresa
   */
  getCompanyData: async (): Promise<CompanyData> => {
    const response = await api.get('/company');
    return response.data;
  },

  /**
   * Atualizar dados da empresa
   */
  updateCompanyData: async (data: UpdateCompanyDto): Promise<CompanyData> => {
    const response = await api.patch('/company', data);
    return response.data;
  },
};
