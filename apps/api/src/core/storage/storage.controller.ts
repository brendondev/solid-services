import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { StorageService } from './storage.service';
import { Public } from '@core/auth/decorators';

/**
 * Controller para servir arquivos do storage local
 * Usado apenas quando S3 não está configurado
 */
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Public()
  @Get('download/:key(*)')
  async downloadFile(@Param('key') key: string, @Res() res: Response) {
    try {
      const fileBuffer = await this.storageService.getLocalFile(decodeURIComponent(key));

      // Extrair nome do arquivo do key
      const fileName = key.split('/').pop() || 'file';

      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.send(fileBuffer);
    } catch (error: any) {
      throw new NotFoundException('Arquivo não encontrado');
    }
  }
}
