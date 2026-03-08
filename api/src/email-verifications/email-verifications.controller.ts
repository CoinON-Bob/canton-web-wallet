import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { EmailVerificationsService } from './email-verifications.service';
import { SendCodeDto } from './dto/send-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';

@ApiTags('email-verifications')
@Controller('email-verifications')
export class EmailVerificationsController {
  constructor(private readonly service: EmailVerificationsService) {}

  @Post('send')
  @ApiOperation({
    summary: 'Send verification code',
    description:
      'Generates a 6-digit code and stores its hash. User must exist (404 otherwise). ' +
      'Dev only: no real email is sent; the code is printed in the backend console log for local testing.',
  })
  @ApiBody({ type: SendCodeDto })
  @ApiResponse({ status: 200, description: 'Code generated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async send(@Body() dto: SendCodeDto) {
    return this.service.send(dto);
  }

  @Post('verify')
  @ApiOperation({
    summary: 'Verify code and set emailVerified',
    description:
      'Verifies the 6-digit code. On success: marks the code as used and sets users.emailVerified = true. ' +
      'Dev only: codes are not sent by email; use the code printed in the backend console after calling send.',
  })
  @ApiBody({ type: VerifyCodeDto })
  @ApiResponse({ status: 200, description: 'Email verified' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verify(@Body() dto: VerifyCodeDto) {
    return this.service.verify(dto);
  }
}
