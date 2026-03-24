import api from './client';

export interface SignDocumentRequest {
  documentType: 'quotation' | 'order';
  documentId: string;
  signatureType?: 'local' | 'govbr';
  govbrAccessToken?: string;
}

export interface SignDocumentResponse {
  signedDocumentUrl: string;
  signatureHash: string;
  signedAt: string;
  signedBy: string;
  signatureType: 'local' | 'govbr';
}

/**
 * Cliente da API de Assinatura Digital
 */
class DigitalSignatureAPI {
  /**
   * Assina um documento (orçamento ou ordem de serviço)
   */
  async signDocument(data: SignDocumentRequest): Promise<SignDocumentResponse> {
    const response = await api.post('/digital-signature/sign', data);
    return response.data;
  }

  /**
   * Obtém URL de autorização OAuth do Gov.br
   * (Disponível em breve)
   */
  async getGovBrAuthUrl(scope: 'sign' | 'signature_session' = 'sign'): Promise<{ authUrl: string }> {
    const response = await api.get('/digital-signature/govbr/auth-url', {
      params: { scope },
    });
    return response.data;
  }

  /**
   * Troca código de autorização por access token
   * (Disponível em breve)
   */
  async exchangeGovBrToken(code: string): Promise<{ accessToken: string }> {
    const response = await api.post('/digital-signature/govbr/exchange-token', { code });
    return response.data;
  }
}

export const digitalSignatureAPI = new DigitalSignatureAPI();
