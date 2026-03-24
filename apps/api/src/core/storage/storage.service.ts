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
    // Suporta tanto S3_* quanto AWS_* (Railway usa AWS_*)
    const endpoint = process.env.S3_ENDPOINT || process.env.AWS_ENDPOINT_URL;
    const region = process.env.S3_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
    const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    this.bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET_NAME || 'solid-service';
    this.localStoragePath = process.env.LOCAL_STORAGE_PATH || './uploads';

    // DEBUG: Log todas as variáveis S3
    this.logger.log('=== S3 Configuration Debug ===');
    this.logger.log(`S3_ENDPOINT: ${endpoint || 'NOT SET'}`);
    this.logger.log(`S3_REGION: ${region}`);
    this.logger.log(`S3_BUCKET: ${this.bucket}`);
    this.logger.log(`S3_ACCESS_KEY_ID: ${accessKeyId ? `${accessKeyId.substring(0, 10)}...` : 'NOT SET'}`);
    this.logger.log(`S3_SECRET_ACCESS_KEY: ${secretAccessKey ? `${secretAccessKey.substring(0, 10)}...` : 'NOT SET'}`);
    this.logger.log('==============================');

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
      this.logger.log(`✅ Storage inicializado: ${endpoint ? 'MinIO/T3' : 'AWS S3'} - bucket: ${this.bucket} - region: ${region}`);
    } else {
      this.s3Client = null;
      this.logger.warn(
        `❌ S3 não configurado. Usando armazenamento local em: ${this.localStoragePath}. ` +
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
      this.logger.log(`Getting download URL for key: ${key} | useS3: ${this.useS3} | s3Client: ${!!this.s3Client}`);

      if (this.useS3 && this.s3Client) {
        // Gerar URL assinada do S3
        this.logger.log(`Generating S3 signed URL for bucket: ${this.bucket}, key: ${key}`);
        const command = new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        });

        const url = await getSignedUrl(this.s3Client, command, { expiresIn });
        this.logger.log(`✅ S3 signed URL generated: ${url.substring(0, 50)}...`);
        return url;
      } else {
        // Para storage local, retornar endpoint de download
        this.logger.log(`❌ Using local storage URL (S3 not configured)`);
        return `/api/v1/storage/download/${encodeURIComponent(key)}`;
      }
    } catch (error: any) {
      this.logger.error(`Erro ao gerar URL de download: ${error.message}`, error.stack);
      throw new Error(`Falha ao gerar URL de download: ${error.message}`);
    }
  }

  /**
   * Obtém arquivo do storage (S3 ou local)
   * @param key - Key do arquivo no S3 ou path local
   * @returns Buffer do arquivo
   */
  async getFile(key: string): Promise<Buffer> {
    try {
      if (this.useS3 && this.s3Client) {
        // Buscar do S3
        this.logger.log(`Baixando arquivo do S3: ${key}`);
        const command = new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        });

        const response = await this.s3Client.send(command);

        // Converter stream para buffer
        const chunks: Uint8Array[] = [];
        for await (const chunk of response.Body as any) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        this.logger.log(`✅ Arquivo baixado do S3: ${key} (${buffer.length} bytes)`);
        return buffer;
      } else {
        // Buscar do filesystem local
        this.logger.log(`Lendo arquivo local: ${key}`);
        const filePath = path.join(this.localStoragePath, key);
        const buffer = await fs.readFile(filePath);
        this.logger.log(`✅ Arquivo lido localmente: ${key} (${buffer.length} bytes)`);
        return buffer;
      }
    } catch (error: any) {
      this.logger.error(`Erro ao obter arquivo: ${error.message}`, error.stack);
      throw new Error(`Arquivo não encontrado: ${error.message}`);
    }
  }

  /**
   * Obtém arquivo do storage local (usado quando S3 não está configurado)
   * @deprecated Use getFile() instead
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
