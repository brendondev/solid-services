import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

/**
 * Storage Service usando AWS S3 SDK v3
 *
 * Compatível com:
 * - AWS S3 (produção)
 * - MinIO (desenvolvimento local)
 *
 * Configuração via env:
 * - S3_ENDPOINT (opcional - apenas para MinIO)
 * - S3_REGION
 * - S3_BUCKET
 * - S3_ACCESS_KEY_ID
 * - S3_SECRET_ACCESS_KEY
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION || 'us-east-1';
    this.bucket = process.env.S3_BUCKET || 'solid-service';

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin',
      },
      forcePathStyle: !!endpoint, // Necessário para MinIO
    });

    this.logger.log(`Storage inicializado: ${endpoint ? 'MinIO' : 'AWS S3'} - bucket: ${this.bucket}`);
  }

  /**
   * Faz upload de um arquivo
   * @param file - Buffer ou stream do arquivo
   * @param tenantId - ID do tenant (para isolamento)
   * @param folder - Pasta/namespace (ex: 'orders', 'customers')
   * @param originalName - Nome original do arquivo
   * @returns Key do arquivo no S3
   */
  async uploadFile(
    file: Buffer,
    tenantId: string,
    folder: string,
    originalName: string,
  ): Promise<string> {
    const fileExtension = originalName.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `${tenantId}/${folder}/${fileName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: this.getContentType(fileExtension || ''),
        Metadata: {
          originalName,
          tenantId,
        },
      });

      await this.s3Client.send(command);

      this.logger.log(`Arquivo enviado: ${key}`);
      return key;
    } catch (error: any) {
      this.logger.error(`Erro ao fazer upload: ${error.message}`, error.stack);
      throw new Error(`Falha no upload do arquivo: ${error.message}`);
    }
  }

  /**
   * Gera URL assinada para download
   * @param key - Key do arquivo no S3
   * @param expiresIn - Tempo de expiração em segundos (padrão: 1 hora)
   * @returns URL assinada
   */
  async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error: any) {
      this.logger.error(`Erro ao gerar URL assinada: ${error.message}`, error.stack);
      throw new Error(`Falha ao gerar URL de download: ${error.message}`);
    }
  }

  /**
   * Deleta um arquivo
   * @param key - Key do arquivo no S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);

      this.logger.log(`Arquivo deletado: ${key}`);
    } catch (error: any) {
      this.logger.error(`Erro ao deletar arquivo: ${error.message}`, error.stack);
      throw new Error(`Falha ao deletar arquivo: ${error.message}`);
    }
  }

  /**
   * Valida o tamanho do arquivo (máx 10MB)
   */
  validateFileSize(size: number, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return size <= maxSizeBytes;
  }

  /**
   * Valida extensão do arquivo
   */
  validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? allowedExtensions.includes(extension) : false;
  }

  /**
   * Determina Content-Type baseado na extensão
   */
  private getContentType(extension: string): string {
    const contentTypes: Record<string, string> = {
      // Imagens
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',

      // Documentos
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      txt: 'text/plain',

      // Outros
      zip: 'application/zip',
      rar: 'application/x-rar-compressed',
    };

    return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
  }
}
