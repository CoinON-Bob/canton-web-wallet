import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  /** Lazy connect: first query will connect. Avoids startup failure when DB is temporarily unreachable. */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
