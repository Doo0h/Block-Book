'use client';

import { Award, BookMarked, Coins, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BlockBookShell } from '../components/blockbook-shell';
import { connectMetaMask, getConnectedWalletAddress, switchOrAddExpectedNetwork } from '../lib/metamask';

type StudentInfo = {
  registered: boolean;
  studentAddress: string;
  balance: string;
  totalEarned: string;
  totalSpent: string;
  lastUpdated: string;
};

type OnChainBook = {
  _id: string;
  blockchainBookId: number;
  title: string;
  author: string;
  ownerAddress?: string;
};

type OnChainEscrow = {
  tradeId: number;
  blockchainBookId: number;
  buyerAddress: string;
  sellerAddress: string;
  status: string;
  tokenUsed?: number;
  discountAmount?: number;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

function sameAddress(left?: string, right?: string) {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

export function MyPage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [books, setBooks] = useState<OnChainBook[]>([]);
  const [escrows, setEscrows] = useState<OnChainEscrow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('지갑을 연결하면 등록된 학생 지갑의 도서, 거래, BBT 정보를 확인할 수 있습니다.');

  const loadMyData = async (address: string) => {
    setIsLoading(true);
    setMessage('마이페이지 정보를 불러오는 중입니다.');

    try {
      const [studentResponse, booksResponse, escrowsResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/tokens/student/${address}`, { cache: 'no-store' }),
        fetch(`${apiBaseUrl}/books/on-chain`, { cache: 'no-store' }),
        fetch(`${apiBaseUrl}/escrow/on-chain/list`, { cache: 'no-store' }),
      ]);

      const studentData = (await studentResponse.json()) as StudentInfo & { message?: string };
      const booksData = (await booksResponse.json()) as OnChainBook[];
      const escrowsData = (await escrowsResponse.json()) as OnChainEscrow[];

      if (!studentResponse.ok) {
        throw new Error(studentData.message || '학생 지갑 정보를 불러오지 못했습니다.');
      }

      setStudentInfo(studentData);
      setBooks(Array.isArray(booksData) ? booksData : []);
      setEscrows(Array.isArray(escrowsData) ? escrowsData : []);
      setMessage(
        studentData.registered
          ? '등록된 학생 지갑의 정보를 표시합니다.'
          : '이 지갑은 아직 학생 지갑으로 등록되지 않았습니다. token-test에서 먼저 등록하세요.',
      );
    } catch (error) {
      setStudentInfo(null);
      setMessage(error instanceof Error ? error.message : '마이페이지 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      await switchOrAddExpectedNetwork();
      const result = await connectMetaMask();
      setWalletAddress(result.address);
      await loadMyData(result.address);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '지갑 연결에 실패했습니다.');
    }
  };

  useEffect(() => {
    const loadConnectedWallet = async () => {
      const address = await getConnectedWalletAddress();

      if (address) {
        setWalletAddress(address);
        await loadMyData(address);
      }
    };

    void loadConnectedWallet();
  }, []);

  const myBooks = useMemo(
    () => books.filter((book) => sameAddress(book.ownerAddress, walletAddress)),
    [books, walletAddress],
  );

  const myEscrows = useMemo(
    () => escrows.filter((escrow) => sameAddress(escrow.buyerAddress, walletAddress) || sameAddress(escrow.sellerAddress, walletAddress)),
    [escrows, walletAddress],
  );

  const visible = Boolean(walletAddress && studentInfo?.registered);
  const activeTrades = myEscrows.filter((escrow) => escrow.status === 'LOCKED').length;
  const latestReward = Number(studentInfo?.totalEarned ?? 0) - Number(studentInfo?.totalSpent ?? 0);

  return (
    <BlockBookShell
      title="마이페이지"
      subtitle="등록된 학생 지갑에 한해서 도서, 거래, 보상 정보를 표시합니다."
      actions={
        <button
          type="button"
          onClick={connectWallet}
          className="w-full rounded-2xl bg-[#d9e8ff] px-4 py-3 text-sm font-semibold text-[#456fcf]"
        >
          지갑 연결
        </button>
      }
    >
      <section className="space-y-4">
        <div className="rounded-[28px] border border-[#dbe6f5] bg-white p-4 text-sm leading-6 text-[#6f829b] shadow-card">
          <div className="break-all">Wallet: {walletAddress || '-'}</div>
          <div className="mt-1">{isLoading ? '불러오는 중...' : message}</div>
        </div>

        {!visible ? (
          <div className="rounded-[32px] border border-[#dbe6f5] bg-white p-5 text-sm leading-6 text-[#6f829b] shadow-card">
            학생 지갑으로 등록된 계정만 개인 정보를 볼 수 있습니다. 토큰 테스트 페이지에서 학생 지갑을 등록하고 BBT를 지급한 뒤 다시 연결하세요.
          </div>
        ) : null}

        {visible && studentInfo ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: BookMarked, label: '등록 도서', value: `${myBooks.length}권` },
                { icon: ShieldCheck, label: '진행 거래', value: `${activeTrades}건` },
                { icon: Coins, label: '보유 BBT', value: `${studentInfo.balance} BBT` },
                { icon: Award, label: '순 보상', value: `${latestReward} BBT` },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.label} className="rounded-[28px] border border-[#dbe6f5] bg-white p-5 shadow-card">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#7ca1ef]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-4 text-xs text-[#94a6be]">{item.label}</div>
                    <div className="mt-1 text-lg font-semibold tracking-tight text-[#314158]">{item.value}</div>
                  </article>
                );
              })}
            </div>

            <section className="rounded-[32px] border border-[#dbe6f5] bg-white p-5 shadow-card">
              <div className="text-base font-semibold text-[#314158]">내 거래 현황</div>
              <div className="mt-4 space-y-3">
                {myEscrows.length === 0 ? (
                  <div className="rounded-[24px] bg-[#f7faff] px-4 py-4 text-sm text-[#7b8ea8]">아직 연결된 거래가 없습니다.</div>
                ) : null}
                {myEscrows.slice(0, 5).map((escrow) => {
                  const book = books.find((item) => item.blockchainBookId === escrow.blockchainBookId);
                  return (
                    <div key={escrow.tradeId} className="rounded-[24px] bg-[#f7faff] px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-[#314158]">{book?.title ?? `BOOK #${escrow.blockchainBookId}`}</div>
                          <div className="mt-1 text-xs text-[#7b8ea8]">{escrow.status}</div>
                          {escrow.tokenUsed ? (
                            <div className="mt-1 text-xs text-[#7b8ea8]">
                              {escrow.tokenUsed} BBT 사용 / {escrow.discountAmount?.toLocaleString() ?? 0}원 할인
                            </div>
                          ) : null}
                        </div>
                        <div className="text-xs font-semibold text-[#314158]">#{escrow.tradeId}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[32px] border border-[#dbe6f5] bg-white p-5 shadow-card">
              <div className="text-base font-semibold text-[#314158]">토큰 활동</div>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[24px] bg-[#f7faff] px-4 py-4">
                  <div className="text-sm font-semibold text-[#314158]">누적 지급</div>
                  <div className="mt-1 text-sm text-[#6f90e6]">{studentInfo.totalEarned} BBT</div>
                </div>
                <div className="rounded-[24px] bg-[#f7faff] px-4 py-4">
                  <div className="text-sm font-semibold text-[#314158]">누적 사용</div>
                  <div className="mt-1 text-sm text-[#6f90e6]">{studentInfo.totalSpent} BBT</div>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </section>
    </BlockBookShell>
  );
}
