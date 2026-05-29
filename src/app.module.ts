import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// DB 없이 토큰 기능만 테스트하기 위해 잠시 주석 처리
// import { ConfigService } from '@nestjs/config';
// import { MongooseModule } from '@nestjs/mongoose';
// import { BooksModule } from './modules/books/books.module';
// import { EscrowModule } from './modules/escrow/escrow.module';
// import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { TokensModule } from './modules/tokens/tokens.module';
// import { TradesModule } from './modules/trades/trades.module';
// import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // DB 없이 테스트하기 위해 Mongoose 연결 임시 비활성화
    // MongooseModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     uri: configService.get<string>('MONGODB_URI'),
    //   }),
    // }),

    // DB 또는 다른 모듈 의존성이 있는 기능은 임시 비활성화
    // UsersModule,
    // BooksModule,
    // TradesModule,
    // EscrowModule,
    TokensModule,
    // RecommendationsModule,
  ],
})
export class AppModule {}