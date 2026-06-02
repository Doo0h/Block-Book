import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RewardTokenDto } from './dto/reward-token.dto';
import { UseTokenDto } from './dto/use-token.dto';
import { TokensService } from './tokens.service';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  // 보상 토큰 지급
  @Post('reward')
  reward(@Body() rewardTokenDto: RewardTokenDto) {
    return this.tokensService.reward(rewardTokenDto);
  }

  // 토큰 사용
  @Post('use')
  use(@Body() useTokenDto: UseTokenDto) {
    return this.tokensService.use(useTokenDto);
  }

  // 사용자별 토큰 거래 내역 조회
  @Get('history/:userId')
  history(@Param('userId') userId: string) {
    return this.tokensService.history(userId);
  }

  // 온체인 학생 등록
  @Post('register-student')
  registerStudent(@Body() registerStudentDto: RegisterStudentDto) {
    return this.tokensService.registerStudent(
      registerStudentDto.studentAddress,
      registerStudentDto.studentId,
    );
  }

  // 온체인 BBT 잔액 조회
  @Get('balance/:studentAddress')
  getBalance(@Param('studentAddress') studentAddress: string) {
    return this.tokensService.getBalanceByAddress(studentAddress);
  }

  // 도서 구매 전 예상 할인 금액 조회
  // 예: /tokens/preview-discount?bookPrice=15000&tokenAmount=20
  @Get('preview-discount')
  previewDiscount(
    @Query('bookPrice') bookPrice: string,
    @Query('tokenAmount') tokenAmount: string,
  ) {
    return this.tokensService.previewDiscount(
      Number(bookPrice),
      Number(tokenAmount),
    );
  }

  // 온체인 학생 정보 조회
  @Get('student/:studentAddress')
  getStudentInfo(@Param('studentAddress') studentAddress: string) {
    return this.tokensService.getStudentInfo(studentAddress);
  }
}
