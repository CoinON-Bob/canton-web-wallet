import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';

@ApiTags('audit-logs')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs (placeholder)' })
  list() {
    return { message: 'Audit logs list placeholder' };
  }
}
