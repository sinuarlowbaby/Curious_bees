import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  healthCheck() {
    return {
      status: 'ok',
      service: 'ReCollab API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      docs: '/api',
    };
  }

  @Get('health')
  health() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
