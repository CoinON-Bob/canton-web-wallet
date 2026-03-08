import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const CODE_EXPIRES_MINUTES = 10;

@Injectable()
export class EmailVerificationsService {
  private readonly logger = new Logger(EmailVerificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private hashCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  private generateSixDigitCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  async send(dto: { email: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const code = this.generateSixDigitCode();
    const codeHash = this.hashCode(code);
    const expiresAt = new Date(Date.now() + CODE_EXPIRES_MINUTES * 60 * 1000);

    const existing = await this.prisma.emailVerification.findFirst({
      where: { email: dto.email, usedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      await this.prisma.emailVerification.update({
        where: { id: existing.id },
        data: { codeHash, expiresAt, userId: user.id },
      });
    } else {
      await this.prisma.emailVerification.create({
        data: {
          email: dto.email,
          codeHash,
          expiresAt,
          userId: user.id,
        },
      });
    }

    this.logger.log(`[Email verification] ${dto.email} => code: ${code} (expires in ${CODE_EXPIRES_MINUTES} min). Dev only: no email sent.`);

    const res: { success: boolean; message: string; devCode?: string } = { success: true, message: 'Verification code generated' };
    if (process.env.NODE_ENV === 'development') {
      res.devCode = code;
    }
    return res;
  }

  async verify(dto: { email: string; code: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const record = await this.prisma.emailVerification.findFirst({
      where: {
        email: dto.email,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new BadRequestException('No valid verification code found or code expired');
    }

    const codeHash = this.hashCode(dto.code);
    if (record.codeHash !== codeHash) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.$transaction([
      this.prisma.emailVerification.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      }),
    ]);

    return { success: true, message: 'Email verified' };
  }
}
