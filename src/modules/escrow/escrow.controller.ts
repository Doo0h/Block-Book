import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LockEscrowDto } from './dto/lock-escrow.dto';
import { EscrowService } from './escrow.service';

@Controller('escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post('lock')
  lock(@Body() lockEscrowDto: LockEscrowDto) {
    return this.escrowService.lock(lockEscrowDto.tradeId);
  }

  @Post(':tradeId/confirm')
  confirm(@Param('tradeId') tradeId: string) {
    return this.escrowService.confirm(tradeId);
  }

  @Post(':tradeId/release')
  release(@Param('tradeId') tradeId: string) {
    return this.escrowService.release(tradeId);
  }

  @Get(':tradeId')
  findByTradeId(@Param('tradeId') tradeId: string) {
    return this.escrowService.findByTradeId(tradeId);
  }
}
