import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BooksModule } from '../books/books.module';
import { TradesModule } from '../trades/trades.module';
import { Escrow, EscrowSchema } from './schemas/escrow.schema';
import { EscrowController } from './escrow.controller';
import { EscrowService } from './escrow.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Escrow.name, schema: EscrowSchema }]),
    TradesModule,
    BooksModule,
  ],
  controllers: [EscrowController],
  providers: [EscrowService],
})
export class EscrowModule {}
