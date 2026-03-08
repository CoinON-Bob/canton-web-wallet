import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { WalletsService } from './wallets.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { TransferDto } from './dto/transfer.dto';

@ApiTags('wallets')
@Controller('wallets')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create wallet account (via Node API)' })
  @ApiResponse({ status: 201, description: 'Wallet created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 502, description: 'Node API unreachable' })
  async create(
    @CurrentUser() userId: string,
    @Body() dto: CreateWalletDto,
  ) {
    return this.walletsService.create(userId, dto?.label);
  }

  @Get()
  @ApiOperation({ summary: 'List wallet accounts' })
  @ApiResponse({ status: 200, description: 'List of wallets with balance' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list(@CurrentUser() userId: string) {
    return this.walletsService.list(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get wallet by id and balance' })
  @ApiResponse({ status: 200, description: 'Wallet details with balance' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async findOne(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.walletsService.findOne(id, userId);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer between accounts (via Node API)' })
  @ApiResponse({ status: 200, description: 'Transfer submitted' })
  @ApiResponse({ status: 400, description: 'Bad request (e.g. same wallet)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiResponse({ status: 502, description: 'Node API unreachable' })
  async transfer(@CurrentUser() userId: string, @Body() dto: TransferDto) {
    return this.walletsService.transfer(
      userId,
      dto.fromWalletId,
      dto.toWalletId,
      dto.amount,
    );
  }
}
