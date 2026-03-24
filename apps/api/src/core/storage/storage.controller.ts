import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { StorageService } from './storage.service';
import { Public } from '@core/auth/decorators';

/**
 * Controller para servir arquivos do storage (S3 ou local)
 */
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Public()
  @Get('download/:key(*)')
  async downloadFile(@Param('key') key: string, @Res() res: Response) {
    try {
      // Usar getFile() que detecta automaticamente S3 ou local
      const fileBuffer = await this.storageService.getFile(decodeURIComponent(key));

      // Extrair nome do arquivo do key
      const fileName = key.split('/').pop() || 'file';

      // Detectar Content-Type baseado na extensão
      const extension = fileName.split('.').pop()?.toLowerCase();
      const contentType = this.getContentType(extension || '');

      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', contentType);
      res.send(fileBuffer);
    } catch (error: any) {
      throw new NotFoundException('Arquivo não encontrado');
    }
  }

  /**
   * Determina Content-Type baseado na extensão
   */
  private getContentType(extension: string): string {
    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      txt: 'text/plain',
      zip: 'application/zip',
    };
    return contentTypes[extension] || 'application/octet-stream';
  }
}
