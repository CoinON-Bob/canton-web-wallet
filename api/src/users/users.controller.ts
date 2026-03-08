import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user (requires JWT)' })
  @ApiResponse({ status: 200, description: 'Current user', schema: { properties: { id: { type: 'string' }, email: { type: 'string' }, emailVerified: { type: 'boolean' }, createdAt: { type: 'string' }, updatedAt: { type: 'string' } } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async me(@CurrentUser() userId: string) {
    return this.usersService.getMe(userId);
  }
}
