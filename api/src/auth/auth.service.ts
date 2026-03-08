import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(password, this.saltRounds);
    const user = await this.prisma.user.create({
      data: { email, passwordHash },
    });
    return { id: user.id, email: user.email };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const access_token = this.jwt.sign({ sub: user.id });
    return {
      access_token,
      user: { id: user.id, email: user.email, emailVerified: user.emailVerified },
    };
  }

  /** Simple logout: client discards token. Reserved for future Redis/session invalidation. */
  logout(): { success: boolean } {
    return { success: true };
  }
}
