import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Contract, JsonRpcProvider, Wallet } from 'ethers';
import { FilterQuery, Model } from 'mongoose';
import { BookStatus } from '../../common/enums/book-status.enum';
import { UsersService } from '../users/users.service';
import { CreateBookDto } from './dto/create-book.dto';
import { QueryBooksDto } from './dto/query-books.dto';
import { RegisterBookOnChainDto } from './dto/register-book-on-chain.dto';
import { Book, BookDocument } from './schemas/book.schema';
import { OnChainBook, OnChainBookDocument } from './schemas/on-chain-book.schema';

const BOOK_REGISTRY_ABI = [
  'function registerBook(uint256 _id, string _title, string _author, string _status) public',
];

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
    @InjectModel(OnChainBook.name) private readonly onChainBookModel: Model<OnChainBookDocument>,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async create(createBookDto: CreateBookDto) {
    await this.usersService.findById(createBookDto.sellerId);

    const book = new this.bookModel(createBookDto);
    const blockchainBookId = BigInt(`0x${book.id}`).toString();
    const blockchainTxHash = await this.registerBookOnChain(
      blockchainBookId,
      createBookDto.title,
      createBookDto.author,
      createBookDto.condition,
    );

    book.blockchainBookId = blockchainBookId;
    book.blockchainTxHash = blockchainTxHash;

    return book.save();
  }

  async registerOnChain(registerBookOnChainDto: RegisterBookOnChainDto) {
    const blockchainBookId = String(registerBookOnChainDto.id);
    const contractAddress = this.configService.get<string>('BOOK_REGISTRY_CONTRACT_ADDRESS');
    const blockchainTxHash =
      registerBookOnChainDto.blockchainTxHash ??
      (await this.registerBookOnChain(
        blockchainBookId,
        registerBookOnChainDto.title,
        registerBookOnChainDto.author,
        registerBookOnChainDto.status,
      ));

    return this.onChainBookModel.create({
      blockchainBookId: registerBookOnChainDto.id,
      title: registerBookOnChainDto.title,
      author: registerBookOnChainDto.author,
      status: registerBookOnChainDto.status,
      blockchainTxHash,
      contractAddress: registerBookOnChainDto.contractAddress ?? contractAddress,
      ownerAddress: registerBookOnChainDto.ownerAddress ?? this.configService.get<string>('PLATFORM_WALLET_ADDRESS'),
    });
  }

  async findOnChainBooks() {
    return this.onChainBookModel.find().sort({ createdAt: -1 });
  }

  async getWalletStatus() {
    const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL') ?? '';
    const walletAddress = this.configService.get<string>('PLATFORM_WALLET_ADDRESS') ?? '';
    const contractAddress = this.configService.get<string>('BOOK_REGISTRY_CONTRACT_ADDRESS') ?? '';
    const escrowContractAddress = this.configService.get<string>('ESCROW_CONTRACT_ADDRESS') ?? '';
    const bookTokenContractAddress = this.configService.get<string>('BOOK_TOKEN_CONTRACT_ADDRESS') ?? '';

    if (!rpcUrl || !walletAddress) {
      return {
        connected: false,
        rpcUrl,
        walletAddress,
        contractAddress,
        escrowContractAddress,
        bookTokenContractAddress,
      };
    }

    try {
      const provider = new JsonRpcProvider(rpcUrl);
      const [network, blockNumber, balance] = await Promise.all([
        provider.getNetwork(),
        provider.getBlockNumber(),
        provider.getBalance(walletAddress),
      ]);

      return {
        connected: true,
        rpcUrl,
        walletAddress,
        contractAddress,
        escrowContractAddress,
        bookTokenContractAddress,
        chainId: network.chainId.toString(),
        blockNumber,
        balanceEth: Number(balance) / 1e18,
      };
    } catch (error) {
      return {
        connected: false,
        rpcUrl,
        walletAddress,
        contractAddress,
        escrowContractAddress,
        bookTokenContractAddress,
        error: error instanceof Error ? error.message : 'Failed to connect to blockchain RPC.',
      };
    }
  }

  async findAll(query: QueryBooksDto) {
    const filters: FilterQuery<BookDocument> = {};

    if (query.major) {
      filters.major = query.major;
    }

    if (query.status) {
      filters.status = query.status;
    }

    if (query.keyword) {
      filters.$or = [
        { title: { $regex: query.keyword, $options: 'i' } },
        { author: { $regex: query.keyword, $options: 'i' } },
        { tags: { $regex: query.keyword, $options: 'i' } },
      ];
    }

    return this.bookModel.find(filters).populate('sellerId', 'name department grade').sort({ createdAt: -1 });
  }

  async findById(bookId: string) {
    const book = await this.bookModel.findById(bookId).populate('sellerId', 'name department grade');

    if (!book) {
      throw new NotFoundException('Book not found.');
    }

    return book;
  }

  async updateStatus(bookId: string, status: BookStatus) {
    const book = await this.bookModel.findByIdAndUpdate(bookId, { status }, { new: true });

    if (!book) {
      throw new NotFoundException('Book not found.');
    }

    return book;
  }

  private async registerBookOnChain(bookId: string, title: string, author: string, status: string) {
    const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL');
    const contractAddress = this.configService.get<string>('BOOK_REGISTRY_CONTRACT_ADDRESS');
    const privateKey = this.configService.get<string>('PLATFORM_PRIVATE_KEY');
    const walletAddress = this.configService.get<string>('PLATFORM_WALLET_ADDRESS');

    if (!rpcUrl || !contractAddress || contractAddress === ZERO_ADDRESS) {
      return undefined;
    }

    const provider = new JsonRpcProvider(rpcUrl);
    const signer =
      privateKey && privateKey !== 'replace_with_private_key'
        ? new Wallet(privateKey, provider)
        : walletAddress
          ? await provider.getSigner(walletAddress)
          : undefined;

    if (!signer) {
      return undefined;
    }

    const contract = new Contract(contractAddress, BOOK_REGISTRY_ABI, signer);
    const tx = await contract.registerBook(bookId, title, author, status);

    await tx.wait();
    return tx.hash as string;
  }
}
