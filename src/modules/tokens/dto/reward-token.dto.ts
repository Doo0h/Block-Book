import { Type } from 'class-transformer';
import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ActivityType } from 'src/common/enums/activity-type.enum';

export class RewardTokenDto {
  @IsMongoId()
  userId: string;

  @IsEnum(ActivityType)
  activityType: ActivityType;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
