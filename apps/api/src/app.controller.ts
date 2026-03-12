import { Controller, Get } from '@nestjs/common';
import { Public } from './core/auth';

@Controller()
export class AppController {
  @Public()
  @Get()
  index() {
    return {
      status: 'ok',
      service: 'solid-services-api',
      docs: '/api/docs',
      health: '/health',
      version: '1.0.0',
    };
  }

  @Public()
  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
