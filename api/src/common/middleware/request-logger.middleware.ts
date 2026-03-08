import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const { method, originalUrl, ip } = req;

    res.on('finish', () => {
      const statusCode = res.statusCode;
      const duration = Date.now() - start;
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${duration}ms - ${ip || 'unknown'}`,
      );
    });

    next();
  }
}
