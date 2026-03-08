import { Controller, Post, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiProperty } from '@nestjs/swagger';
import { CantonService } from './canton.service';

class CreateWalletResponseDto {
  @ApiProperty({ description: 'Canton Party ID (e.g. hint::fingerprint)' })
  partyId!: string;
  @ApiProperty({ description: 'Public key (base64)' })
  publicKey!: string;
}

class GetPartyResponseDto {
  @ApiProperty({ description: 'Canton Party ID' })
  partyId!: string;
}

@ApiTags('canton')
@Controller('canton')
export class CantonController {
  constructor(private readonly cantonService: CantonService) {}

  @Post('create-wallet')
  @ApiOperation({
    summary: 'Create external party (wallet)',
    description:
      'Creates a new key pair, allocates an external party on Canton, and returns partyId and publicKey. Private key is not saved or returned.',
  })
  @ApiResponse({ status: 201, description: 'External party created', type: CreateWalletResponseDto })
  @ApiResponse({ status: 502, description: 'Canton network unreachable' })
  async createWallet(): Promise<CreateWalletResponseDto> {
    const result = await this.cantonService.createWallet();
    return { partyId: result.partyId, publicKey: result.publicKey };
  }

  @Get('party/:id')
  @ApiOperation({
    summary: 'Get party by ID',
    description: 'Returns the party if it exists and the connected user has access (e.g. after create-wallet).',
  })
  @ApiParam({ name: 'id', description: 'Canton Party ID (e.g. hint::fingerprint)' })
  @ApiResponse({ status: 200, description: 'Party found', type: GetPartyResponseDto })
  @ApiResponse({ status: 404, description: 'Party not found or no access' })
  @ApiResponse({ status: 502, description: 'Canton network unreachable' })
  async getParty(@Param('id') id: string): Promise<GetPartyResponseDto> {
    const party = await this.cantonService.getParty(id);
    if (!party) {
      throw new NotFoundException('Party not found or no access');
    }
    return { partyId: party.partyId };
  }
}
