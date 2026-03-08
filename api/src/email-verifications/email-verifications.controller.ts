import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmailVerificationsService } from './email-verifications.service';

@ApiTags('email-verifications')
@Controller('email-verifications')
export class EmailVerificationsController {
  constructor(private readonly service: EmailVerificationsService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send verification email (placeholder)' })
  send() {
    return { message: 'Email verification send placeholder' };
  }
}
