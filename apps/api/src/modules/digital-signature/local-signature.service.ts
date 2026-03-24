import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Service de assinatura local
 *
 * IMPORTANTE: Este service é apenas para desenvolvimento/testes.
 * Em produção, usar sempre assinatura Gov.br ou certificados ICP-Brasil válidos.
 *
 * Responsável por:
 * - Assinatura simples de PDFs (não é assinatura digital válida)
 * - Geração de hash de assinatura
 * - Simulação de PKCS#7
 */
@Injectable()
export class LocalSignatureService {
  /**
   * "Assina" um PDF localmente
   *
   * NOTA: Esta não é uma assinatura digital válida.
   * Apenas adiciona um hash SHA-256 ao documento para identificação.
   * Use apenas em desenvolvimento.
   *
   * @param pdfBuffer Buffer do PDF original
   * @returns Buffer do PDF "assinado"
   */
  async signPDF(pdfBuffer: Buffer): Promise<Buffer> {
    // Calcular hash do PDF
    const hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

    // Criar "assinatura" simples
    const signature = {
      algorithm: 'SHA-256',
      hash,
      signedAt: new Date().toISOString(),
      signer: 'local-development',
      warning:
        'Esta não é uma assinatura digital válida. Apenas para desenvolvimento.',
    };

    // Adicionar metadados ao PDF
    // Em implementação real, usar biblioteca como node-forge ou pdf-lib
    const signatureData = Buffer.from(
      '\n%SIGNATURE\n' + JSON.stringify(signature, null, 2) + '\n%%EOF\n',
    );

    // Concatenar PDF original + assinatura
    return Buffer.concat([pdfBuffer, signatureData]);
  }

  /**
   * Verifica se um PDF possui assinatura local
   *
   * @param pdfBuffer Buffer do PDF
   * @returns true se possui assinatura local
   */
  hasLocalSignature(pdfBuffer: Buffer): boolean {
    const content = pdfBuffer.toString('utf-8');
    return content.includes('%SIGNATURE');
  }

  /**
   * Extrai dados da assinatura local
   *
   * @param pdfBuffer Buffer do PDF assinado
   * @returns Dados da assinatura ou null
   */
  extractSignature(pdfBuffer: Buffer): any | null {
    try {
      const content = pdfBuffer.toString('utf-8');
      const match = content.match(/%SIGNATURE\n(.*?)\n%%EOF/s);

      if (!match || !match[1]) {
        return null;
      }

      return JSON.parse(match[1]);
    } catch (error) {
      return null;
    }
  }
}
