import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ConfirmOnChainEscrowDto } from './dto/confirm-on-chain-escrow.dto';
import { CreateOnChainEscrowDto } from './dto/create-on-chain-escrow.dto';
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

  @Post('on-chain/lock')
  createOnChainLock(@Body() createOnChainEscrowDto: CreateOnChainEscrowDto) {
    return this.escrowService.createOnChainLock(createOnChainEscrowDto);
  }

  @Post('on-chain/:tradeId/confirm')
  confirmOnChainLock(@Param('tradeId') tradeId: string, @Body() confirmOnChainEscrowDto: ConfirmOnChainEscrowDto) {
    return this.escrowService.confirmOnChainLock(Number(tradeId), confirmOnChainEscrowDto);
  }

  @Get('on-chain/list')
  findOnChainEscrows() {
    return this.escrowService.findOnChainEscrows();
  }
}
