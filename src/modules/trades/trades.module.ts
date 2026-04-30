import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BooksModule } from '../books/books.module';
import { UsersModule } from '../users/users.module';
import { Trade, TradeSchema } from './schemas/trade.schema';
import { TradesController } from './trades.controller';
import { TradesService } from './trades.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Trade.name, schema: TradeSchema }]), BooksModule, UsersModule],
  controllers: [TradesController],
  providers: [TradesService],
  exports: [TradesService, MongooseModule],
})
export class TradesModule {}
