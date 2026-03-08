import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User created', schema: { properties: { id: { type: 'string' }, email: { type: 'string' } }, required: ['id', 'email'] } })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and get JWT' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login success', schema: { properties: { access_token: { type: 'string' }, user: { type: 'object', properties: { id: { type: 'string' }, email: { type: 'string' } }, required: ['id', 'email'] } }, required: ['access_token', 'user'] } })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout (client discards token; reserved for future session/Redis)' })
  @ApiResponse({ status: 200, description: 'Logout success' })
  logout() {
    return this.authService.logout();
  }
}
