/**
 * Tipos de assinatura suportados
 */
export enum SignatureType {
  /** Assinatura local usando certificado armazenado */
  LOCAL = 'local',
  /** Assinatura usando API do Gov.br */
  GOVBR = 'govbr',
}

/**
 * Status da assinatura
 */
export enum SignatureStatus {
  PENDING = 'pending',
  SIGNED = 'signed',
  FAILED = 'failed',
}

/**
 * Resultado da assinatura
 */
export interface SignatureResult {
  /** URL do documento assinado */
  signedDocumentUrl: string;
  /** Hash SHA-256 da assinatura */
  signatureHash: string;
  /** Data da assinatura */
  signedAt: Date;
  /** ID do usuário que assinou */
  signedBy: string;
  /** Tipo de assinatura utilizado */
  signatureType: SignatureType;
}

/**
 * Configuração OAuth Gov.br
 */
export interface GovBrOAuthConfig {
  /** Client ID fornecido pelo Gov.br */
  clientId: string;
  /** Client Secret fornecido pelo Gov.br */
  clientSecret: string;
  /** URL de callback registrada */
  redirectUri: string;
  /** URL base da API (staging ou produção) */
  baseUrl: string;
  /** URL base OAuth */
  oauthUrl: string;
}
