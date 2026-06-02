'use client';

import { BookOpen, Coins, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BlockBookShell } from '../components/blockbook-shell';

type OnChainBook = {
  _id: string;
};

type OnChainEscrow = {
  status: string;
  tokenUsed?: number;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

const features = [
  {
    icon: ShieldCheck,
    title: '안전한 에스크로 거래',
    description: '구매 금액을 먼저 예치하고 수령 확인 후 거래 상태를 확정합니다.',
  },
  {
    icon: BookOpen,
    title: '도서 이력 타임라인',
    description: '등록, 구매, 수령 확인까지 온체인 기록과 앱 기록을 함께 확인합니다.',
  },
  {
    icon: Coins,
    title: 'BBT 토큰 할인',
    description: '등록된 학생 지갑은 보상 토큰을 받아 도서 구매 할인에 사용할 수 있습니다.',
  },
];

export function LandingPage() {
  const [books, setBooks] = useState<OnChainBook[]>([]);
  const [escrows, setEscrows] = useState<OnChainEscrow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [booksResponse, escrowsResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/books/on-chain`, { cache: 'no-store' }),
          fetch(`${apiBaseUrl}/escrow/on-chain/list`, { cache: 'no-store' }),
        ]);

        const booksData = (await booksResponse.json()) as OnChainBook[];
        const escrowsData = (await escrowsResponse.json()) as OnChainEscrow[];

        setBooks(Array.isArray(booksData) ? booksData : []);
        setEscrows(Array.isArray(escrowsData) ? escrowsData : []);
      } finally {
        setIsLoading(false);
      }
    };

    void loadStats();
  }, []);

  const stats = useMemo(() => {
    const completedTrades = escrows.filter((escrow) => escrow.status === 'CONFIRMED' || escrow.status === 'RELEASED').length;
    const totalTokenUsed = escrows.reduce((sum, escrow) => sum + (escrow.tokenUsed ?? 0), 0);

    return [
      { label: '등록 도서', value: isLoading ? '-' : `${books.length}권` },
      { label: '안전 거래', value: isLoading ? '-' : `${completedTrades}/${escrows.length}건` },
      { label: '사용 BBT', value: isLoading ? '-' : `${totalTokenUsed} BBT` },
    ];
  }, [books.length, escrows, isLoading]);

  return (
    <BlockBookShell
      title="전공서적 거래를 더 안전하고 간단하게"
      subtitle="BlockBook은 대학생을 위한 전공서적 거래 앱입니다. 도서 등록, 에스크로 거래, BBT 보상 흐름을 한 화면에서 다룹니다."
    >
      <section className="space-y-5">
        <div className="rounded-[32px] border border-[#dbe6f5] bg-[linear-gradient(180deg,#eef5ff_0%,#f8fbff_100%)] px-6 py-6 text-[#314158] shadow-card">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7ca1ef]">Trusted Campus Market</div>
          <h2 className="mt-3 text-[28px] font-semibold leading-9 tracking-tight">
            블록체인은 뒤에 두고,
            <br />
            사용성은 앞으로.
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#6f829b]">
            실제 등록 도서와 에스크로 기록을 기반으로 현재 시장 상태를 보여줍니다.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-[#deebfb] bg-white/80 px-3 py-4">
                <div className="text-lg font-semibold">{stat.value}</div>
                <div className="mt-1 text-xs text-[#7b8ea8]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="rounded-[28px] border border-[#dbe6f5] bg-white px-5 py-5 shadow-card">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#7ca1ef]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-[#314158]">{feature.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#7b8ea8]">{feature.description}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </BlockBookShell>
  );
}
