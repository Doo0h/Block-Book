'use client';

import { Bell, BookOpen, ChevronLeft, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { PropsWithChildren, ReactNode } from 'react';

type AppShellProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  showBackButton?: boolean;
}>;

const tabs = [
  { label: '홈', href: '/landing' },
  { label: '도서', href: '/books' },
  { label: '거래', href: '/trades/current' },
  { label: 'MY', href: '/mypage' },
];

type WalletStatus = {
  connected: boolean;
  rpcUrl?: string;
  walletAddress?: string;
  contractAddress?: string;
  escrowContractAddress?: string;
  bookTokenContractAddress?: string;
  chainId?: string;
  blockNumber?: number;
  balanceEth?: number;
  error?: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

export function BlockBookShell({ title, subtitle, actions, showBackButton = false, children }: AppShellProps) {
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletStatus, setWalletStatus] = useState<WalletStatus | null>(null);
  const [isWalletLoading, setIsWalletLoading] = useState(false);

  const toggleWallet = async () => {
    const nextOpen = !isWalletOpen;
    setIsWalletOpen(nextOpen);

    if (!nextOpen || walletStatus || isWalletLoading) {
      return;
    }

    setIsWalletLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/books/wallet/status`, { cache: 'no-store' });
      const data = (await response.json()) as WalletStatus;
      setWalletStatus(data);
    } catch (error) {
      setWalletStatus({
        connected: false,
        error: error instanceof Error ? error.message : '지갑 상태를 불러오지 못했습니다.',
      });
    } finally {
      setIsWalletLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f9ff] text-[#314158]">
      <div className="mx-auto flex min-h-screen w-full max-w-[460px] flex-col bg-[#f6f9ff]">
        <header className="sticky top-0 z-30 border-b border-[#dbe6f5] bg-[#f9fbff]/95 px-5 pb-4 pt-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showBackButton ? (
                <Link href="/books" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#5b6f8d]">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#bcd4ff] text-[#3f6fd8] shadow-lg shadow-blue-100/70">
                  <BookOpen className="h-5 w-5" />
                </div>
              )}
              <div>
                <div className="text-base font-semibold tracking-tight text-[#314158]">BlockBook</div>
                <div className="text-xs text-[#7b8ea8]">Campus textbook market</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#5b6f8d]">
                <Bell className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={toggleWallet}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#d9e8ff] px-3.5 py-2.5 text-sm font-semibold text-[#456fcf]"
              >
                <Wallet className="h-4 w-4" />
                지갑
              </button>
            </div>
          </div>

          {isWalletOpen ? (
            <div className="mt-4 rounded-[24px] border border-[#dbe6f5] bg-white p-4 text-xs leading-5 text-[#6f829b] shadow-card">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-[#314158]">지갑 상태</div>
                <div className={walletStatus?.connected ? 'text-[#246b45]' : 'text-[#a34b4b]'}>
                  {isWalletLoading ? '확인 중' : walletStatus?.connected ? '연결됨' : '미연결'}
                </div>
              </div>

              {isWalletLoading ? <div>블록체인 RPC 상태를 확인하고 있습니다.</div> : null}

              {walletStatus ? (
                <div className="space-y-1 break-all">
                  <div>Wallet: {walletStatus.walletAddress || '-'}</div>
                  <div>Balance: {walletStatus.balanceEth?.toFixed(4) ?? '-'} ETH</div>
                  <div>Chain ID: {walletStatus.chainId || '-'}</div>
                  <div>Block: {walletStatus.blockNumber ?? '-'}</div>
                  <div>RPC: {walletStatus.rpcUrl || '-'}</div>
                  <div>BookRegistry: {walletStatus.contractAddress || '-'}</div>
                  <div>Escrow: {walletStatus.escrowContractAddress || '-'}</div>
                  <div>BookToken: {walletStatus.bookTokenContractAddress || '-'}</div>
                  {walletStatus.error ? <div className="text-[#a34b4b]">Error: {walletStatus.error}</div> : null}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 rounded-[28px] border border-[#d9e7fb] bg-[#edf5ff] px-4 py-4">
            <div className="text-[22px] font-semibold leading-8 tracking-tight text-[#314158]">{title}</div>
            {subtitle ? <p className="mt-2 text-sm leading-6 text-[#6f829b]">{subtitle}</p> : null}
          </div>
        </header>

        <main className="flex-1 px-5 pb-28 pt-5">{children}</main>

        <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto w-full max-w-[460px] border-t border-[#dbe6f5] bg-[#f9fbff]/95 px-5 py-3 backdrop-blur">
          <div className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                className="rounded-2xl px-3 py-2 text-center text-xs font-semibold text-[#7b8ea8] transition hover:bg-[#edf5ff] hover:text-[#5b82df]"
              >
                {tab.label}
              </Link>
            ))}
          </div>
          {actions ? <div className="mt-3">{actions}</div> : null}
        </div>
      </div>
    </div>
  );
}
