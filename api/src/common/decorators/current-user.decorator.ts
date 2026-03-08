import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
  userId: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;
    if (!user?.userId) {
      return '';
    }
    return user.userId;
  },
);
