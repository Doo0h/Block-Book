import { Controller, Get, Param } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('users/:userId')
  getForUser(@Param('userId') userId: string) {
    return this.recommendationsService.getForUser(userId);
  }
}
