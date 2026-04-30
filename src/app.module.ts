import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BooksModule } from './modules/books/books.module';
import { EscrowModule } from './modules/escrow/escrow.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { TradesModule } from './modules/trades/trades.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    UsersModule,
    BooksModule,
    TradesModule,
    EscrowModule,
    TokensModule,
    RecommendationsModule,
  ],
})
export class AppModule {}
