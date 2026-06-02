'use client';

import { CheckCircle2, LockKeyhole, PlugZap, ReceiptText } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BlockBookShell } from '../components/blockbook-shell';

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

const tokenValueWon = 100;
const steps = [
  '판매자 지갑 연결',
  '판매자 책 등록',
  '구매자 지갑 연결',
  '토큰 할인 계산',
  'Escrow 금액 예치',
  '구매자 수령 확인',
  '판매자에게 정산',
];

function getEthereumProvider() {
  return (window as Window & { ethereum?: EthereumProvider }).ethereum;
}

export function TradeProgressPage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [bookPrice, setBookPrice] = useState('10000');
  const [tokenAmount, setTokenAmount] = useState('0');
  const [error, setError] = useState('');

  const discount = useMemo(() => {
    const price = Number(bookPrice) || 0;
    const tokens = Number(tokenAmount) || 0;
    return Math.min(price, tokens * tokenValueWon);
  }, [bookPrice, tokenAmount]);

  const finalPrice = Math.max((Number(bookPrice) || 0) - discount, 0);

  const connectWallet = async () => {
    setError('');

    const ethereum = getEthereumProvider();

    if (!ethereum) {
      setError('MetaMask 지갑을 먼저 설치하거나 브라우저에서 활성화하세요.');
      return;
    }

    const accounts = (await ethereum.request({ method: 'eth_requestAccounts' })) as string[];
    setWalletAddress(accounts[0] ?? '');
  };

  return (
    <BlockBookShell
      title="거래 진행"
      subtitle="사용자 지갑, 토큰 할인, Escrow 예치와 정산 흐름을 한 화면에서 확인합니다."
      showBackButton
      actions={
        <button
          type="button"
          onClick={connectWallet}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#bdd6ff] px-4 py-3 text-sm font-semibold text-[#466fcb]"
        >
          <PlugZap className="h-4 w-4" />
          지갑 연결
        </button>
      }
    >
      <section className="space-y-4">
        <div className="rounded-[32px] border border-[#dbe6f5] bg-white p-5 shadow-card">
          <div className="flex items-center gap-2 text-base font-semibold text-[#314158]">
            <ReceiptText className="h-4 w-4 text-[#7ca1ef]" />
            할인 계산
          </div>

          <div className="mt-4 grid gap-3">
            <input
              value={bookPrice}
              onChange={(event) => setBookPrice(event.target.value)}
              inputMode="numeric"
              className="w-full rounded-2xl border border-[#dbe6f5] bg-[#f7faff] px-4 py-3 text-sm outline-none focus:border-[#8fb4ff]"
              placeholder="책 가격"
            />
            <input
              value={tokenAmount}
              onChange={(event) => setTokenAmount(event.target.value)}
              inputMode="numeric"
              className="w-full rounded-2xl border border-[#dbe6f5] bg-[#f7faff] px-4 py-3 text-sm outline-none focus:border-[#8fb4ff]"
              placeholder="사용할 BBT 토큰"
            />
          </div>

          <div className="mt-4 space-y-2 rounded-2xl bg-[#f7faff] p-3 text-xs leading-5 text-[#6f829b]">
            <div>Wallet: {walletAddress || '-'}</div>
            <div>할인: {discount.toLocaleString()}원</div>
            <div>Escrow 예치 금액: {finalPrice.toLocaleString()}원</div>
          </div>

          {error ? <div className="mt-3 text-sm text-[#a34b4b]">{error}</div> : null}
        </div>

        <div className="rounded-[32px] border border-[#dbe6f5] bg-white p-5 shadow-card">
          <div className="flex items-center gap-2 text-base font-semibold text-[#314158]">
            <LockKeyhole className="h-4 w-4 text-[#7ca1ef]" />
            Escrow 흐름
          </div>

          <div className="mt-5 space-y-5">
            {steps.map((step, index) => (
              <div key={step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[#456fcf]">
                    {index < 2 ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-sm">{index + 1}</span>}
                  </div>
                  {index < steps.length - 1 ? <div className="mt-2 h-12 w-px bg-[#dbe6f5]" /> : null}
                </div>
                <div className="flex-1 rounded-[24px] bg-[#f7faff] px-4 py-4">
                  <div className="text-sm font-semibold text-[#314158]">{step}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </BlockBookShell>
  );
}
