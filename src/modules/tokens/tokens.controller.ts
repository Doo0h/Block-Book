import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RewardTokenDto } from './dto/reward-token.dto';
import { UseTokenDto } from './dto/use-token.dto';
import { TokensService } from './tokens.service';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Post('reward')
  reward(@Body() rewardTokenDto: RewardTokenDto) {
    return this.tokensService.reward(rewardTokenDto);
  }

  @Post('use')
  use(@Body() useTokenDto: UseTokenDto) {
    return this.tokensService.use(useTokenDto);
  }

  @Get('history/:userId')
  history(@Param('userId') userId: string) {
    return this.tokensService.history(userId);
  }
}
