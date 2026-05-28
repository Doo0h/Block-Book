import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Contract, JsonRpcProvider, Wallet } from 'ethers';
import { Model } from 'mongoose';
import { BookStatus } from '../../common/enums/book-status.enum';
import { TradeStatus } from '../../common/enums/trade-status.enum';
import { BooksService } from '../books/books.service';
import { TradesService } from '../trades/trades.service';
import { Escrow, EscrowDocument } from './schemas/escrow.schema';
import { ConfirmOnChainEscrowDto } from './dto/confirm-on-chain-escrow.dto';
import { CreateOnChainEscrowDto } from './dto/create-on-chain-escrow.dto';
import { OnChainEscrow, OnChainEscrowDocument } from './schemas/on-chain-escrow.schema';

const ESCROW_ABI = [
  'function lockFunds(uint256 tradeId, address seller) external payable returns (bool)',
  'function confirmDelivery(uint256 tradeId) external returns (bool)',
  'function releaseFunds(uint256 tradeId) external returns (bool)',
];

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

type PopulatedWalletUser = {
  walletAddress: string;
};

@Injectable()
export class EscrowService {
  constructor(
    @InjectModel(Escrow.name) private readonly escrowModel: Model<EscrowDocument>,
    @InjectModel(OnChainEscrow.name) private readonly onChainEscrowModel: Model<OnChainEscrowDocument>,
    private readonly tradesService: TradesService,
    private readonly booksService: BooksService,
    private readonly configService: ConfigService,
  ) {}

  async lock(tradeId: string) {
    const trade = await this.tradesService.findById(tradeId);

    if (trade.status !== TradeStatus.PENDING) {
      throw new BadRequestException('Only pending trades can be locked.');
    }

    const buyer = trade.buyerId as unknown as PopulatedWalletUser;
    const seller = trade.sellerId as unknown as PopulatedWalletUser;
    const txHash = await this.sendEscrowTransaction('lockFunds', tradeId, trade.offeredPrice, seller.walletAddress);
    const contractAddress = this.configService.get<string>('ESCROW_CONTRACT_ADDRESS') ?? '';

    await this.escrowModel.findOneAndUpdate(
      { tradeId },
      {
        tradeId,
        amount: trade.offeredPrice,
        buyerWalletAddress: buyer.walletAddress,
        sellerWalletAddress: seller.walletAddress,
        contractAddress,
        lockTxHash: txHash,
      },
      { upsert: true, new: true },
    );

    return this.tradesService.appendTimeline(tradeId, TradeStatus.LOCKED, 'Escrow funds locked on blockchain.', txHash);
  }

  async confirm(tradeId: string) {
    const trade = await this.tradesService.findById(tradeId);

    if (trade.status !== TradeStatus.LOCKED) {
      throw new BadRequestException('Trade must be locked before confirmation.');
    }

    const txHash = await this.sendEscrowTransaction('confirmDelivery', tradeId);

    const escrow = await this.escrowModel.findOneAndUpdate(
      { tradeId },
      { confirmTxHash: txHash },
      { new: true },
    );

    if (!escrow) {
      throw new NotFoundException('Escrow record not found.');
    }

    return this.tradesService.appendTimeline(tradeId, TradeStatus.CONFIRMED, 'Buyer confirmed book receipt.', txHash);
  }

  async release(tradeId: string) {
    const trade = await this.tradesService.findById(tradeId);

    if (trade.status !== TradeStatus.CONFIRMED) {
      throw new BadRequestException('Trade must be confirmed before release.');
    }

    const txHash = await this.sendEscrowTransaction('releaseFunds', tradeId);

    const escrow = await this.escrowModel.findOneAndUpdate(
      { tradeId },
      { releaseTxHash: txHash },
      { new: true },
    );

    if (!escrow) {
      throw new NotFoundException('Escrow record not found.');
    }

    await this.booksService.updateStatus(String(trade.bookId._id), BookStatus.SOLD);
    return this.tradesService.appendTimeline(tradeId, TradeStatus.RELEASED, 'Escrow funds released to seller.', txHash);
  }

  async findByTradeId(tradeId: string) {
    const escrow = await this.escrowModel.findOne({ tradeId });

    if (!escrow) {
      throw new NotFoundException('Escrow not found.');
    }

    return escrow;
  }

  async createOnChainLock(createOnChainEscrowDto: CreateOnChainEscrowDto) {
    return this.onChainEscrowModel.findOneAndUpdate(
      { tradeId: createOnChainEscrowDto.tradeId },
      {
        ...createOnChainEscrowDto,
        status: TradeStatus.LOCKED,
        tokenUsed: createOnChainEscrowDto.tokenUsed ?? 0,
        discountAmount: createOnChainEscrowDto.discountAmount ?? 0,
      },
      { upsert: true, new: true },
    );
  }

  async confirmOnChainLock(tradeId: number, confirmOnChainEscrowDto: ConfirmOnChainEscrowDto) {
    const escrow = await this.onChainEscrowModel.findOneAndUpdate(
      { tradeId },
      {
        status: TradeStatus.CONFIRMED,
        confirmTxHash: confirmOnChainEscrowDto.confirmTxHash,
      },
      { new: true },
    );

    if (!escrow) {
      throw new NotFoundException('On-chain escrow record not found.');
    }

    return escrow;
  }

  async findOnChainEscrows() {
    return this.onChainEscrowModel.find().sort({ createdAt: -1 });
  }

  private async sendEscrowTransaction(
    method: 'lockFunds' | 'confirmDelivery' | 'releaseFunds',
    tradeId: string,
    amount?: number,
    sellerWalletAddress?: string,
  ) {
    const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL');
    const contractAddress = this.configService.get<string>('ESCROW_CONTRACT_ADDRESS');
    const privateKey = this.configService.get<string>('PLATFORM_PRIVATE_KEY');

    if (
      !rpcUrl ||
      !contractAddress ||
      contractAddress === ZERO_ADDRESS ||
      !privateKey ||
      privateKey === 'replace_with_private_key'
    ) {
      return `mock-tx-${method}-${tradeId}-${Date.now()}`;
    }

    const provider = new JsonRpcProvider(rpcUrl);
    const wallet = new Wallet(privateKey, provider);
    const contract = new Contract(contractAddress, ESCROW_ABI, wallet);
    const blockchainTradeId = BigInt(`0x${tradeId}`);

    const tx =
      method === 'lockFunds'
        ? await contract[method](blockchainTradeId, sellerWalletAddress, { value: BigInt(amount ?? 0) })
        : await contract[method](blockchainTradeId);

    await tx.wait();
    return tx.hash as string;
  }
}
