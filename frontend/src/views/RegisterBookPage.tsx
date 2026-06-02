'use client';

import { BrowserProvider, Contract } from 'ethers';
import { CheckCircle2, Loader2, PlugZap, Send } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BlockBookShell } from '../components/blockbook-shell';
import { switchOrAddExpectedNetwork } from '../lib/metamask';

type RegisterBookResponse = {
  blockchainBookId?: number;
  title?: string;
  author?: string;
  price?: number;
  status?: string;
  blockchainTxHash?: string;
  contractAddress?: string;
  ownerAddress?: string;
};

type WalletStatus = {
  contractAddress?: string;
};

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';
const statusOptions = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'];
const bookRegistryAbi = ['function registerBook(uint256 _id, string _title, string _author, string _status) public'];

function getEthereumProvider() {
  return (window as Window & { ethereum?: EthereumProvider }).ethereum;
}

export function RegisterBookPage() {
  const [form, setForm] = useState({ id: '', title: '', author: '', price: '15000', status: 'GOOD' });
  const [walletAddress, setWalletAddress] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<RegisterBookResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadContractAddress = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/books/wallet/status`, { cache: 'no-store' });
        const data = (await response.json()) as WalletStatus;
        setContractAddress(data.contractAddress ?? '');
      } catch {
        setContractAddress('');
      }
    };

    void loadContractAddress();
  }, []);

  const canSubmit = useMemo(
    () => form.id && form.title && form.author && form.price && form.status && walletAddress && contractAddress,
    [contractAddress, form, walletAddress],
  );

  const updateForm = (name: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const connectWallet = async () => {
    setError('');

    const ethereum = getEthereumProvider();

    if (!ethereum) {
      setError('MetaMask 지갑을 먼저 설치하거나 브라우저에서 활성화하세요.');
      return;
    }

    await switchOrAddExpectedNetwork();
    const accounts = (await ethereum.request({ method: 'eth_requestAccounts' })) as string[];
    setWalletAddress(accounts[0] ?? '');
  };

  const getPrice = () => {
    const price = Number(form.price);

    if (!Number.isInteger(price) || price <= 0) {
      throw new Error('책 가격은 1원 이상 숫자로 입력하세요.');
    }

    return price;
  };

  const submitBook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult(null);
    setError('');

    try {
      const ethereum = getEthereumProvider();

      if (!ethereum) {
        throw new Error('MetaMask 지갑이 필요합니다.');
      }

      if (!contractAddress) {
        throw new Error('BookRegistry 계약 주소를 불러오지 못했습니다.');
      }

      const price = getPrice();
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const ownerAddress = await signer.getAddress();
      const contract = new Contract(contractAddress, bookRegistryAbi, signer);
      const tx = await contract.registerBook(Number(form.id), form.title, form.author, form.status);

      await tx.wait();

      const response = await fetch(`${apiBaseUrl}/books/on-chain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Number(form.id),
          title: form.title,
          author: form.author,
          price,
          status: form.status,
          blockchainTxHash: tx.hash,
          contractAddress,
          ownerAddress,
        }),
      });

      const data = (await response.json()) as RegisterBookResponse & { message?: string | string[] };

      if (!response.ok) {
        const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(message || '도서 등록 저장에 실패했습니다.');
      }

      setWalletAddress(ownerAddress);
      setResult(data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '도서 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BlockBookShell
      title="책 등록"
      subtitle="판매자 지갑으로 BookRegistry에 등록하고, 가격을 포함한 등록 정보를 앱 DB에 저장합니다."
      showBackButton
      actions={
        <button
          form="book-register-form"
          disabled={!canSubmit || isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#bdd6ff] px-4 py-3 text-sm font-semibold text-[#466fcb] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          블록체인에 등록
        </button>
      }
    >
      <section className="space-y-4">
        <div className="rounded-[28px] border border-[#dbe6f5] bg-white p-4 text-xs leading-5 text-[#6f829b] shadow-card">
          <button
            type="button"
            onClick={connectWallet}
            className="mb-3 inline-flex items-center gap-2 rounded-2xl bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#466fcb]"
          >
            <PlugZap className="h-4 w-4" />
            지갑 연결
          </button>
          <div className="break-all">Wallet: {walletAddress || '-'}</div>
          <div className="mt-1 break-all">BookRegistry: {contractAddress || '-'}</div>
        </div>

        <form
          id="book-register-form"
          onSubmit={submitBook}
          className="space-y-4 rounded-[28px] border border-[#dbe6f5] bg-white p-4 shadow-card"
        >
          <div>
            <div className="text-sm font-semibold text-[#314158]">도서 정보</div>
            <div className="mt-1 text-xs text-[#7b8ea8]">같은 ID는 같은 컨트랙트에서 다시 등록할 수 없습니다.</div>
          </div>

          <Input label="Book ID" value={form.id} onChange={(value) => updateForm('id', value)} placeholder="예: 101" inputMode="numeric" />
          <Input label="제목" value={form.title} onChange={(value) => updateForm('title', value)} placeholder="예: 운영체제" />
          <Input label="저자" value={form.author} onChange={(value) => updateForm('author', value)} placeholder="예: 김교수" />
          <Input label="가격" value={form.price} onChange={(value) => updateForm('price', value)} placeholder="예: 18000" inputMode="numeric" />

          <label className="block">
            <span className="text-xs font-medium text-[#7b8ea8]">상태</span>
            <select
              value={form.status}
              onChange={(event) => updateForm('status', event.target.value)}
              className="mt-1 w-full rounded-2xl border border-[#dbe6f5] bg-[#f7faff] px-4 py-3 text-sm outline-none focus:border-[#8fb4ff]"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </form>

        {result ? (
          <div className="rounded-[28px] border border-[#cde8da] bg-[#f5fffa] p-4 shadow-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#246b45]">
              <CheckCircle2 className="h-4 w-4" />
              등록 완료
            </div>
            <div className="mt-3 space-y-2 break-all text-xs leading-5 text-[#426554]">
              <div>Book ID: {result.blockchainBookId}</div>
              <div>Title: {result.title}</div>
              <div>Author: {result.author}</div>
              <div>Price: {result.price?.toLocaleString() ?? '-'}원</div>
              <div>Status: {result.status}</div>
              <div>Owner: {result.ownerAddress || '-'}</div>
              <div>Contract: {result.contractAddress || '-'}</div>
              <div>Tx Hash: {result.blockchainTxHash || '-'}</div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[28px] border border-[#f2c8c8] bg-[#fff6f6] p-4 text-sm leading-6 text-[#a34b4b]">
            {error}
          </div>
        ) : null}
      </section>
    </BlockBookShell>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: 'numeric';
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-[#7b8ea8]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="mt-1 w-full rounded-2xl border border-[#dbe6f5] bg-[#f7faff] px-4 py-3 text-sm outline-none focus:border-[#8fb4ff]"
      />
    </label>
  );
}
