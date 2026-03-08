import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const body =
      typeof message === 'object' && message !== null
        ? { ...(message as object), statusCode: status }
        : { message, statusCode: status };

    if (status >= 500) {
      this.logger.error(
        `${req.method} ${req.url} ${status}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    res.status(status).json(body);
  }
}
