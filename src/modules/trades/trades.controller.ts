import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateTradeDto } from './dto/create-trade.dto';
import { TradesService } from './trades.service';

@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post()
  create(@Body() createTradeDto: CreateTradeDto) {
    return this.tradesService.create(createTradeDto);
  }

  @Get()
  findAll() {
    return this.tradesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tradesService.findById(id);
  }
}
