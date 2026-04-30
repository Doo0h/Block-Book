import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { comparePassword, hashPassword } from 'src/common/utils/password.util';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async signup(createUserDto: CreateUserDto) {
    const existingUser = await this.userModel.findOne({
      $or: [{ email: createUserDto.email.toLowerCase() }, { walletAddress: createUserDto.walletAddress.toLowerCase() }],
    });

    if (existingUser) {
      throw new BadRequestException('Email or wallet address already exists.');
    }

    const passwordHash = await hashPassword(createUserDto.password);

    const user = await this.userModel.create({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
      walletAddress: createUserDto.walletAddress.toLowerCase(),
      passwordHash,
    });

    return this.toSafeUser(user);
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userModel.findOne({ email: loginUserDto.email.toLowerCase() });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordMatched = await comparePassword(loginUserDto.password, user.passwordHash);

    if (!passwordMatched) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return {
      message: 'Login successful',
      user: this.toSafeUser(user),
    };
  }

  async findAll() {
    const users = await this.userModel.find().sort({ createdAt: -1 });
    return users.map((user) => this.toSafeUser(user));
  }

  async findById(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async updateTokenBalance(userId: string, amount: number) {
    const user = await this.findById(userId);
    user.tokenBalance += amount;

    if (user.tokenBalance < 0) {
      throw new BadRequestException('Insufficient token balance.');
    }

    await user.save();
    return this.toSafeUser(user);
  }

  private toSafeUser(user: UserDocument) {
    const { passwordHash, ...safeUser } = user.toObject();
    return safeUser;
  }
}
