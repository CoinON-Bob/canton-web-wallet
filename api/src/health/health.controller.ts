import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Liveness check' })
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('db')
  @ApiOperation({ summary: 'Database connectivity check' })
  async checkDb() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', db: 'connected' };
    } catch (e) {
      return { status: 'error', db: 'disconnected' };
    }
  }
}
