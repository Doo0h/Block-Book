import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TokenTransactionType } from '../../common/enums/token-transaction-type.enum';
import { UsersService } from '../users/users.service';
import { RewardTokenDto } from './dto/reward-token.dto';
import { UseTokenDto } from './dto/use-token.dto';
import { TokenTransaction, TokenTransactionDocument } from './schemas/token-transaction.schema';

@Injectable()
export class TokensService {
  constructor(
    @InjectModel(TokenTransaction.name)
    private readonly tokenTransactionModel: Model<TokenTransactionDocument>,
    private readonly usersService: UsersService,
  ) {}

  async reward(rewardTokenDto: RewardTokenDto) {
    const user = await this.usersService.updateTokenBalance(rewardTokenDto.userId, rewardTokenDto.amount);

    const transaction = await this.tokenTransactionModel.create({
      userId: rewardTokenDto.userId,
      type: TokenTransactionType.REWARD,
      activityType: rewardTokenDto.activityType,
      amount: rewardTokenDto.amount,
      description: rewardTokenDto.description ?? `${rewardTokenDto.activityType} participation reward`,
    });

    return { user, transaction };
  }

  async use(useTokenDto: UseTokenDto) {
    const user = await this.usersService.updateTokenBalance(useTokenDto.userId, -useTokenDto.amount);

    const transaction = await this.tokenTransactionModel.create({
      userId: useTokenDto.userId,
      type: TokenTransactionType.USE,
      amount: useTokenDto.amount,
      description: useTokenDto.reason,
    });

    return { user, transaction };
  }

  async history(userId: string) {
    return this.tokenTransactionModel.find({ userId }).sort({ createdAt: -1 });
  }
}
