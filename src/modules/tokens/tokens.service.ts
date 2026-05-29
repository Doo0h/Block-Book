import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ethers } from 'ethers';
import { RewardTokenDto } from './dto/reward-token.dto';
import { UseTokenDto } from './dto/use-token.dto';

const BOOK_TOKEN_ABI = [
  'function registerStudent(address _student, string _studentId) public',
  'function rewardToken(address _student, uint256 _amount, string _eventName) public',
  'function spendToken(uint256 _bookPrice, uint256 _tokenAmount, string _bookId) public',
  'function balances(address) public view returns (uint256)',
  'function previewDiscount(uint256 _bookPrice, uint256 _tokenAmount) public view returns (uint256,uint256)',
  'function getStudentInfo(address _student) public view returns (bool,uint256,uint256,uint256,uint256)',
];

@Injectable()
export class TokensService implements OnModuleInit {
  private readonly provider: ethers.JsonRpcProvider;
  private readonly readContract: ethers.Contract;
  private readonly contractAddress: string;

  constructor() {
    this.contractAddress = process.env.BOOK_TOKEN_CONTRACT_ADDRESS as string;
    this.provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);

    this.readContract = new ethers.Contract(
      this.contractAddress,
      BOOK_TOKEN_ABI,
      this.provider,
    );
  }

  private getPlatformWalletAddress() {
    return (process.env.PLATFORM_WALLET_ADDRESS ?? '').toLowerCase();
  }

  private assertNotPlatformWallet(studentAddress: string) {
    if (studentAddress.toLowerCase() === this.getPlatformWalletAddress()) {
      throw new BadRequestException(
        'Admin wallet cannot be used as the student wallet. Connect a different MetaMask account.',
      );
    }
  }

  async onModuleInit() {
    await this.validateContractCompatibility();
    await this.ensureTestStudentRegistered();
  }

  private async validateContractCompatibility() {
    const code = await this.provider.getCode(this.contractAddress);

    if (!code || code === '0x') {
      throw new InternalServerErrorException(
        `No contract is deployed at BOOK_TOKEN_CONTRACT_ADDRESS=${this.contractAddress}.`,
      );
    }

    await this.readStudentInfo(ethers.ZeroAddress);
  }

  private async getWriteContract() {
    const signer = await this.provider.getSigner(
      process.env.PLATFORM_WALLET_ADDRESS as string,
    );

    return new ethers.Contract(
      process.env.BOOK_TOKEN_CONTRACT_ADDRESS as string,
      BOOK_TOKEN_ABI,
      signer,
    );
  }

  private async readStudentInfo(studentAddress: string) {
    try {
      return await this.readContract.getStudentInfo(studentAddress);
    } catch (error) {
      if (
        ethers.isError(error, 'BAD_DATA') ||
        (ethers.isError(error, 'CALL_EXCEPTION') && error.data === '0x')
      ) {
        throw new InternalServerErrorException(
          `BOOK_TOKEN_CONTRACT_ADDRESS=${this.contractAddress} is not compatible with the current BookToken ABI. Redeploy contracts/BookToken.sol and update the env address.`,
        );
      }

      throw error;
    }
  }

  private async waitForReceiptWithTimeout(
    tx: ethers.ContractTransactionResponse,
    timeoutMs = 15000,
  ) {
    return await Promise.race([
      tx.wait(),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);
  }

  private async ensureTestStudentRegistered() {
    const studentAddress = process.env.TEST_STUDENT_ADDRESS;
    const studentId = process.env.TEST_STUDENT_ID ?? '2022810004';

    if (!studentAddress) {
      console.log('[BookToken] TEST_STUDENT_ADDRESS is not set, skipping auto-registration.');
      return;
    }

    if (studentAddress.toLowerCase() === this.getPlatformWalletAddress()) {
      console.log(
        '[BookToken] TEST_STUDENT_ADDRESS matches PLATFORM_WALLET_ADDRESS, so auto-registration is skipped.',
      );
      return;
    }

    try {
      const info = await this.readStudentInfo(studentAddress);
      const isRegistered = info[0];

      if (isRegistered) {
        console.log(`[BookToken] Test student is already registered: ${studentAddress}`);
        return;
      }

      const contract = await this.getWriteContract();
      console.log(`[BookToken] Auto-registering test student: ${studentAddress}`);

      const tx = await contract.registerStudent(studentAddress, studentId);
      const receipt = await this.waitForReceiptWithTimeout(tx);

      console.log(
        `[BookToken] Test student registration submitted: ${receipt?.hash ?? tx.hash}`,
      );
    } catch (error) {
      console.error('[BookToken] Test student auto-registration failed:', error);
    }
  }

  async registerStudent(studentAddress: string, studentId: string) {
    this.assertNotPlatformWallet(studentAddress);

    const info = await this.readStudentInfo(studentAddress);
    const isRegistered = info[0];

    if (isRegistered) {
      return {
        message: 'Student wallet is already registered.',
        studentAddress,
        studentId,
        alreadyRegistered: true,
      };
    }

    const contract = await this.getWriteContract();
    const tx = await contract.registerStudent(studentAddress, studentId);
    const receipt = await this.waitForReceiptWithTimeout(tx);

    return {
      message: receipt
        ? 'Student registration completed.'
        : 'Student registration transaction submitted and waiting for block confirmation.',
      studentAddress,
      studentId,
      txHash: receipt?.hash ?? tx.hash,
      confirmed: Boolean(receipt),
    };
  }

  async reward(rewardTokenDto: RewardTokenDto) {
    const contract = await this.getWriteContract();
    const tx = await contract.rewardToken(
      rewardTokenDto.studentAddress,
      rewardTokenDto.amount,
      rewardTokenDto.activityType,
    );
    const receipt = await this.waitForReceiptWithTimeout(tx);

    return {
      message: receipt
        ? 'Reward token transfer completed.'
        : 'Reward transaction submitted and waiting for block confirmation.',
      confirmed: Boolean(receipt),
      onChain: {
        studentAddress: rewardTokenDto.studentAddress,
        amount: rewardTokenDto.amount,
        activityType: rewardTokenDto.activityType,
        txHash: receipt?.hash ?? tx.hash,
      },
    };
  }

  async use(useTokenDto: UseTokenDto) {
    const contract = await this.getWriteContract();
    const tx = await contract.spendToken(
      useTokenDto.bookPrice,
      useTokenDto.amount,
      useTokenDto.bookId,
    );
    const receipt = await this.waitForReceiptWithTimeout(tx);

    return {
      message: receipt
        ? 'Token spending completed.'
        : 'Spend transaction submitted and waiting for block confirmation.',
      confirmed: Boolean(receipt),
      onChain: {
        studentAddress: useTokenDto.studentAddress,
        bookId: useTokenDto.bookId,
        bookPrice: useTokenDto.bookPrice,
        tokenAmount: useTokenDto.amount,
        txHash: receipt?.hash ?? tx.hash,
      },
    };
  }

  async getBalanceByAddress(studentAddress: string) {
    const balance = await this.readContract.balances(studentAddress);

    return {
      studentAddress,
      balance: balance.toString(),
      symbol: 'BBT',
    };
  }

  async previewDiscount(bookPrice: number, tokenAmount: number) {
    const result = await this.readContract.previewDiscount(
      bookPrice,
      tokenAmount,
    );

    return {
      bookPrice,
      tokenAmount,
      discountWon: result[0].toString(),
      finalPrice: result[1].toString(),
    };
  }

  async getStudentInfo(studentAddress: string) {
    const result = await this.readStudentInfo(studentAddress);

    return {
      studentAddress,
      registered: result[0],
      balance: result[1].toString(),
      totalEarned: result[2].toString(),
      totalSpent: result[3].toString(),
      lastUpdated: result[4].toString(),
    };
  }

  async history(userId: string) {
    return {
      message: 'History is not stored yet because the project is currently running without a database integration.',
      userId,
      history: [],
    };
  }
}
