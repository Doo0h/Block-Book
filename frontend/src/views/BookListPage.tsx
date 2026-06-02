'use client';

import { BrowserProvider, Contract, parseEther } from 'ethers';
import { CheckCircle2, ExternalLink, Loader2, Plus, Search, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BlockBookShell } from '../components/blockbook-shell';

type OnChainBook = {
  _id: string;
  blockchainBookId: number;
  title: string;
  author: string;
  status: string;
  blockchainTxHash?: string;
  contractAddress?: string;
  ownerAddress?: string;
};

type WalletStatus = {
  contractAddress?: string;
  escrowContractAddress?: string;
};

type OnChainEscrow = {
  tradeId: number;
  blockchainBookId: number;
  buyerAddress: string;
  sellerAddress: string;
  amountWei: string;
  escrowContractAddress: string;
  status: string;
  lockTxHash?: string;
  confirmTxHash?: string;
};

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';
const escrowAbi = [
  'function lockFunds(uint256 tradeId, address seller) external payable returns (bool)',
  'function confirmDelivery(uint256 tradeId) external returns (bool)',
];

function getEthereumProvider() {
  return (window as Window & { ethereum?: EthereumProvider }).ethereum;
}

export function BookListPage() {
  const [books, setBooks] = useState<OnChainBook[]>([]);
  const [escrows, setEscrows] = useState<OnChainEscrow[]>([]);
  const [escrowContractAddress, setEscrowContractAddress] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeBookId, setActiveBookId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [keyword, setKeyword] = useState('');

  const loadData = async () => {
    setIsLoading(true);

    try {
      const [booksResponse, walletResponse, escrowsResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/books/on-chain`, { cache: 'no-store' }),
        fetch(`${apiBaseUrl}/books/wallet/status`, { cache: 'no-store' }),
        fetch(`${apiBaseUrl}/escrow/on-chain/list`, { cache: 'no-store' }),
      ]);

      const booksData = (await booksResponse.json()) as OnChainBook[] | { message?: string };
      const walletData = (await walletResponse.json()) as WalletStatus;
      const escrowsData = (await escrowsResponse.json()) as OnChainEscrow[] | { message?: string };

      if (!booksResponse.ok) {
        throw new Error(Array.isArray(booksData) ? '도서 목록을 불러오지 못했습니다.' : booksData.message || '도서 목록을 불러오지 못했습니다.');
      }

      setBooks(Array.isArray(booksData) ? booksData : []);
      setEscrowContractAddress(walletData.escrowContractAddress ?? '');
      setEscrows(Array.isArray(escrowsData) ? escrowsData : []);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '도서 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const escrowByBookId = useMemo(() => {
    const map = new Map<number, OnChainEscrow>();

    escrows.forEach((escrow) => {
      map.set(escrow.blockchainBookId, escrow);
    });

    return map;
  }, [escrows]);

  const normalizedKeyword = keyword.trim().toLowerCase();
  const filteredBooks = normalizedKeyword
    ? books.filter((book) =>
        [
          String(book.blockchainBookId),
          book.title,
          book.author,
          book.status,
          book.ownerAddress ?? '',
          book.contractAddress ?? '',
          book.blockchainTxHash ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedKeyword),
      )
    : books;

  const connectWallet = async () => {
    setError('');

    const ethereum = getEthereumProvider();

    if (!ethereum) {
      setError('MetaMask 지갑을 먼저 설치하거나 브라우저에서 활성화하세요.');
      return '';
    }

    const accounts = (await ethereum.request({ method: 'eth_requestAccounts' })) as string[];
    const account = accounts[0] ?? '';
    setWalletAddress(account);
    return account;
  };

  const buyBook = async (book: OnChainBook) => {
    setError('');
    setNotice('');
    setActiveBookId(book.blockchainBookId);

    try {
      if (!book.ownerAddress) {
        throw new Error('판매자 지갑 주소가 없습니다.');
      }

      if (!escrowContractAddress) {
        throw new Error('Escrow 계약주소를 불러오지 못했습니다.');
      }

      const buyerAddress = walletAddress || (await connectWallet());

      const ethereum = getEthereumProvider();

      if (!buyerAddress || !ethereum) {
        throw new Error('구매자 지갑 연결이 필요합니다.');
      }

      if (buyerAddress.toLowerCase() === book.ownerAddress.toLowerCase()) {
        throw new Error('판매자 지갑으로는 본인 도서를 구매할 수 없습니다.');
      }

      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(escrowContractAddress, escrowAbi, signer);
      const tradeId = Date.now();
      const amountWei = parseEther('1');
      const tx = await contract.lockFunds(tradeId, book.ownerAddress, { value: amountWei });

      await tx.wait();

      const response = await fetch(`${apiBaseUrl}/escrow/on-chain/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradeId,
          blockchainBookId: book.blockchainBookId,
          buyerAddress,
          sellerAddress: book.ownerAddress,
          amountWei: amountWei.toString(),
          escrowContractAddress,
          lockTxHash: tx.hash,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string | string[] };
        const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(message || '에스크로 기록 저장에 실패했습니다.');
      }

      setNotice(`BOOK #${book.blockchainBookId} 구매 금액이 Escrow에 예치되었습니다.`);
      await loadData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '구매 요청에 실패했습니다.');
    } finally {
      setActiveBookId(null);
    }
  };

  const confirmDelivery = async (escrow: OnChainEscrow) => {
    setError('');
    setNotice('');
    setActiveBookId(escrow.blockchainBookId);

    try {
      const buyerAddress = walletAddress || (await connectWallet());

      const ethereum = getEthereumProvider();

      if (!buyerAddress || !ethereum) {
        throw new Error('구매자 지갑 연결이 필요합니다.');
      }

      if (buyerAddress.toLowerCase() !== escrow.buyerAddress.toLowerCase()) {
        throw new Error('구매자 지갑만 수령 확인을 할 수 있습니다.');
      }

      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(escrow.escrowContractAddress, escrowAbi, signer);
      const tx = await contract.confirmDelivery(escrow.tradeId);

      await tx.wait();

      const response = await fetch(`${apiBaseUrl}/escrow/on-chain/${escrow.tradeId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmTxHash: tx.hash }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string | string[] };
        const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(message || '수령 확인 기록 저장에 실패했습니다.');
      }

      setNotice(`BOOK #${escrow.blockchainBookId} 수령 확인이 완료되었습니다.`);
      await loadData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '수령 확인에 실패했습니다.');
    } finally {
      setActiveBookId(null);
    }
  };

  return (
    <BlockBookShell
      title="도서"
      subtitle="등록된 도서를 구매하고 Escrow 예치 상태를 확인합니다."
      actions={
        <Link
          href="/books/register"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#bdd6ff] px-4 py-3 text-sm font-semibold text-[#466fcb]"
        >
          <Plus className="h-4 w-4" />
          책 등록
        </Link>
      }
    >
      <section className="space-y-4">
        <div className="rounded-[28px] border border-[#dbe6f5] bg-white p-4 text-xs leading-5 text-[#6f829b] shadow-card">
          <button
            type="button"
            onClick={connectWallet}
            className="mb-3 inline-flex items-center gap-2 rounded-2xl bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#466fcb]"
          >
            지갑 연결
          </button>
          <div className="break-all">Wallet: {walletAddress || '-'}</div>
          <div className="mt-1 break-all">Escrow: {escrowContractAddress || '-'}</div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#dde7f4] bg-white px-4 py-3 text-sm text-[#7b8ea8] shadow-card">
          <Search className="h-4 w-4 text-[#9bb0cb]" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Book ID, 제목, 지갑주소, 계약주소 검색"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#314158] outline-none placeholder:text-[#9bb0cb]"
          />
        </div>

        {notice ? (
          <div className="rounded-[28px] border border-[#cde8da] bg-[#f5fffa] p-4 text-sm leading-6 text-[#246b45]">
            {notice}
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex items-center justify-center rounded-[28px] border border-[#dbe6f5] bg-white p-8 text-[#6f829b] shadow-card">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            불러오는 중
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[28px] border border-[#f2c8c8] bg-[#fff6f6] p-4 text-sm leading-6 text-[#a34b4b]">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && books.length === 0 ? (
          <div className="rounded-[28px] border border-[#dbe6f5] bg-white p-5 text-sm leading-6 text-[#6f829b] shadow-card">
            아직 등록된 도서가 없습니다.
          </div>
        ) : null}

        {filteredBooks.map((book) => {
          const escrow = escrowByBookId.get(book.blockchainBookId);
          const isActive = activeBookId === book.blockchainBookId;

          return (
            <article key={book._id} className="rounded-[28px] border border-[#dbe6f5] bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-[#7ca1ef]">BOOK #{book.blockchainBookId}</div>
                  <h2 className="mt-1 text-lg font-semibold leading-7 text-[#314158]">{book.title}</h2>
                  <div className="mt-1 text-sm text-[#7b8ea8]">{book.author}</div>
                </div>
                <div className="rounded-2xl bg-[#eef4ff] px-3 py-2 text-xs font-semibold text-[#466fcb]">
                  {escrow?.status ?? book.status}
                </div>
              </div>

              <div className="mt-4 space-y-2 break-all rounded-2xl bg-[#f7faff] p-3 text-xs leading-5 text-[#6f829b]">
                <div>Owner: {book.ownerAddress || '-'}</div>
                <div>BookRegistry: {book.contractAddress || '-'}</div>
                <div>Escrow: {escrow?.escrowContractAddress || escrowContractAddress || '-'}</div>
                <div>Register Tx: {book.blockchainTxHash || '-'}</div>
                {escrow ? <div>Lock Tx: {escrow.lockTxHash || '-'}</div> : null}
                {escrow?.confirmTxHash ? <div>Confirm Tx: {escrow.confirmTxHash}</div> : null}
              </div>

              <div className="mt-3 flex items-center gap-2">
                {!escrow ? (
                  <button
                    type="button"
                    onClick={() => buyBook(book)}
                    disabled={isActive}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#d9e8ff] px-4 py-3 text-sm font-semibold text-[#456fcf] disabled:opacity-60"
                  >
                    {isActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
                    구매하기 1 ETH
                  </button>
                ) : escrow.status === 'LOCKED' ? (
                  <button
                    type="button"
                    onClick={() => confirmDelivery(escrow)}
                    disabled={isActive}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#dff3e8] px-4 py-3 text-sm font-semibold text-[#246b45] disabled:opacity-60"
                  >
                    {isActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    수령 확인
                  </button>
                ) : (
                  <div className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#f2f6fc] px-4 py-3 text-sm font-semibold text-[#6f829b]">
                    <CheckCircle2 className="h-4 w-4" />
                    거래 완료
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#5b82df]">
                <ExternalLink className="h-3.5 w-3.5" />
                Remix books({book.blockchainBookId})에서 같은 값을 확인
              </div>
            </article>
          );
        })}
      </section>
    </BlockBookShell>
  );
}
