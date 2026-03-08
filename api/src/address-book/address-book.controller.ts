import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AddressBookService } from './address-book.service';

@ApiTags('address-book')
@Controller('address-book')
export class AddressBookController {
  constructor(private readonly service: AddressBookService) {}

  @Get()
  @ApiOperation({ summary: 'List address book entries (placeholder)' })
  list() {
    return { message: 'Address book list placeholder' };
  }
}
