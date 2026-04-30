import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BookStatus } from 'src/common/enums/book-status.enum';
import { TradeStatus } from 'src/common/enums/trade-status.enum';
import { BooksService } from '../books/books.service';
import { UsersService } from '../users/users.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { Trade, TradeDocument } from './schemas/trade.schema';

@Injectable()
export class TradesService {
  constructor(
    @InjectModel(Trade.name) private readonly tradeModel: Model<TradeDocument>,
    private readonly booksService: BooksService,
    private readonly usersService: UsersService,
  ) {}

  async create(createTradeDto: CreateTradeDto) {
    const book = await this.booksService.findById(createTradeDto.bookId);
    await this.usersService.findById(createTradeDto.buyerId);

    if (book.status !== BookStatus.AVAILABLE) {
      throw new BadRequestException('Book is not available for trading.');
    }

    const trade = await this.tradeModel.create({
      ...createTradeDto,
      sellerId: book.sellerId,
      timeline: [
        {
          status: TradeStatus.PENDING,
          message: 'Trade created by buyer.',
          createdAt: new Date(),
        },
      ],
    });

    await this.booksService.updateStatus(createTradeDto.bookId, BookStatus.RESERVED);
    return this.findById(trade.id);
  }

  async findAll() {
    return this.tradeModel
      .find()
      .populate('bookId')
      .populate('buyerId', 'name department grade walletAddress')
      .populate('sellerId', 'name department grade walletAddress')
      .sort({ createdAt: -1 });
  }

  async findById(tradeId: string) {
    const trade = await this.tradeModel
      .findById(tradeId)
      .populate('bookId')
      .populate('buyerId', 'name department grade walletAddress')
      .populate('sellerId', 'name department grade walletAddress');

    if (!trade) {
      throw new NotFoundException('Trade not found.');
    }

    return trade;
  }

  async appendTimeline(tradeId: string, status: TradeStatus, message: string, blockchainTxHash?: string) {
    const trade = await this.tradeModel.findById(tradeId);

    if (!trade) {
      throw new NotFoundException('Trade not found.');
    }

    trade.status = status;
    trade.timeline.push({ status, message, createdAt: new Date() });

    if (blockchainTxHash) {
      trade.blockchainTxHash = blockchainTxHash;
    }

    await trade.save();
    return this.findById(tradeId);
  }
}
