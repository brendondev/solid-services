import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Storage Service usando AWS S3 SDK v3 ou filesystem local
 *
 * Compatível com:
 * - AWS S3 (produção com credenciais)
 * - MinIO (desenvolvimento local)
 * - Filesystem local (fallback quando S3 não configurado)
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
  private readonly s3Client: S3Client | null;
  private readonly bucket: string;
  private readonly useS3: boolean;
  private readonly localStoragePath: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION || 'us-east-1';
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    this.bucket = process.env.S3_BUCKET || 'solid-service';
    this.localStoragePath = process.env.LOCAL_STORAGE_PATH || './uploads';

    // Verificar se S3 está configurado
    this.useS3 = !!(accessKeyId && secretAccessKey);

    if (this.useS3) {
      this.s3Client = new S3Client({
        endpoint,
        region,
        credentials: {
          accessKeyId: accessKeyId!,
          secretAccessKey: secretAccessKey!,
        },
        forcePathStyle: !!endpoint, // Necessário para MinIO
      });
      this.logger.log(`Storage inicializado: ${endpoint ? 'MinIO' : 'AWS S3'} - bucket: ${this.bucket}`);
    } else {
      this.s3Client = null;
      this.logger.warn(
        `S3 não configurado. Usando armazenamento local em: ${this.localStoragePath}. ` +
        `Configure S3_ACCESS_KEY_ID e S3_SECRET_ACCESS_KEY para usar S3.`
      );
      // Criar diretório de uploads se não existir
      fs.mkdir(this.localStoragePath, { recursive: true }).catch(() => {});
    }
  }

  /**
   * Faz upload de um arquivo
   * @param file - Buffer ou stream do arquivo
   * @param tenantId - ID do tenant (para isolamento)
   * @param folder - Pasta/namespace (ex: 'orders', 'customers')
   * @param originalName - Nome original do arquivo
   * @returns Key do arquivo no S3 ou path local
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
      if (this.useS3 && this.s3Client) {
        // Upload para S3
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
        this.logger.log(`Arquivo enviado para S3: ${key}`);
      } else {
        // Salvar localmente
        const localPath = path.join(this.localStoragePath, tenantId, folder);
        await fs.mkdir(localPath, { recursive: true });
        const filePath = path.join(localPath, fileName);
        await fs.writeFile(filePath, file);
        this.logger.log(`Arquivo salvo localmente: ${key}`);
      }

      return key;
    } catch (error: any) {
      this.logger.error(`Erro ao fazer upload: ${error.message}`, error.stack);
      throw new Error(`Falha no upload do arquivo: ${error.message}`);
    }
  }

  /**
   * Gera URL assinada para download
   * @param key - Key do arquivo no S3 ou path local
   * @param expiresIn - Tempo de expiração em segundos (padrão: 1 hora)
   * @returns URL assinada ou path local
   */
  async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      if (this.useS3 && this.s3Client) {
        // Gerar URL assinada do S3
        const command = new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        });

        const url = await getSignedUrl(this.s3Client, command, { expiresIn });
        return url;
      } else {
        // Para storage local, retornar endpoint de download
        // O controller precisa servir esses arquivos
        return `/api/v1/storage/download/${encodeURIComponent(key)}`;
      }
    } catch (error: any) {
      this.logger.error(`Erro ao gerar URL de download: ${error.message}`, error.stack);
      throw new Error(`Falha ao gerar URL de download: ${error.message}`);
    }
  }

  /**
   * Obtém arquivo do storage local (usado quando S3 não está configurado)
   */
  async getLocalFile(key: string): Promise<Buffer> {
    try {
      const filePath = path.join(this.localStoragePath, key);
      return await fs.readFile(filePath);
    } catch (error: any) {
      this.logger.error(`Erro ao ler arquivo local: ${error.message}`, error.stack);
      throw new Error(`Arquivo não encontrado: ${error.message}`);
    }
  }

  /**
   * Deleta um arquivo
   * @param key - Key do arquivo no S3 ou path local
   */
  async deleteFile(key: string): Promise<void> {
    try {
      if (this.useS3 && this.s3Client) {
        // Deletar do S3
        const command = new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        });

        await this.s3Client.send(command);
        this.logger.log(`Arquivo deletado do S3: ${key}`);
      } else {
        // Deletar arquivo local
        const filePath = path.join(this.localStoragePath, key);
        await fs.unlink(filePath);
        this.logger.log(`Arquivo deletado localmente: ${key}`);
      }
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
// Force redeploy ter, 17 de mar de 2026 09:11:01
