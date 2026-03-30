import api from './client';

export type EntityType = 'customers' | 'services' | 'suppliers' | 'products';

export interface ImportPreview {
  data: any[];
  totalRows: number;
  columns: string[];
  validationErrors: ValidationError[];
}

export interface ValidationError {
  row: number;
  column: string;
  value: any;
  error: string;
}

export interface ImportResult {
  success: number;
  errors: number;
  warnings: number;
  total: number;
  errorDetails: ErrorDetail[];
}

export interface ErrorDetail {
  row: number;
  error: string;
  data?: any;
}

export const importApi = {
  /**
   * Analisa o arquivo e retorna preview
   */
  async analyze(file: File, entityType: EntityType): Promise<ImportPreview> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);

    const { data } = await api.post<ImportPreview>('/import/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  },

  /**
   * Executa a importação
   */
  async execute(file: File, entityType: EntityType): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);

    const { data } = await api.post<ImportResult>('/import/execute', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  },
};
