import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SystemSettingsService } from './system-settings.service';

@ApiTags('system-settings')
@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly service: SystemSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'List system settings (placeholder)' })
  list() {
    return { message: 'System settings list placeholder' };
  }
}
