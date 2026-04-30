import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { TokenTransaction, TokenTransactionSchema } from './schemas/token-transaction.schema';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TokenTransaction.name, schema: TokenTransactionSchema }]),
    UsersModule,
  ],
  controllers: [TokensController],
  providers: [TokensService],
})
export class TokensModule {}
