import { Module } from '@nestjs/common';
import { EmailVerificationsController } from './email-verifications.controller';
import { EmailVerificationsService } from './email-verifications.service';

@Module({
  controllers: [EmailVerificationsController],
  providers: [EmailVerificationsService],
  exports: [EmailVerificationsService],
})
export class EmailVerificationsModule {}
