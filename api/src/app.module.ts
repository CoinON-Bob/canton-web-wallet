import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configValidationSchema } from './config/env.schema';
import redisConfig from './config/redis.config';
import { PrismaModule } from './prisma/prisma.module';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { WalletKeystoresModule } from './wallet-keystores/wallet-keystores.module';
import { EmailVerificationsModule } from './email-verifications/email-verifications.module';
import { AddressBookModule } from './address-book/address-book.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { SystemSettingsModule } from './system-settings/system-settings.module';
import { CantonModule } from './canton/canton.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      validationOptions: { abortEarly: true },
      load: [redisConfig],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    WalletsModule,
    WalletKeystoresModule,
    EmailVerificationsModule,
    AddressBookModule,
    NotificationsModule,
    AuditLogsModule,
    SystemSettingsModule,
    CantonModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
