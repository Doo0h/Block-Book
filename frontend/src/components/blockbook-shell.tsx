import { Bell, BookOpen, ChevronLeft, Search, Wallet } from 'lucide-react';
import Link from 'next/link';
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

export function BlockBookShell({
  title,
  subtitle,
  actions,
  showBackButton = false,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f6f9ff] text-[#314158]">
      <div className="mx-auto flex min-h-screen w-full max-w-[460px] flex-col bg-[#f6f9ff]">
        <header className="sticky top-0 z-30 border-b border-[#dbe6f5] bg-[#f9fbff]/95 px-5 pb-4 pt-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showBackButton ? (
                <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#5b6f8d]">
                  <ChevronLeft className="h-5 w-5" />
                </button>
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
              <button className="inline-flex items-center gap-2 rounded-2xl bg-[#d9e8ff] px-3.5 py-2.5 text-sm font-semibold text-[#456fcf]">
                <Wallet className="h-4 w-4" />
                지갑
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-[28px] border border-[#d9e7fb] bg-[#edf5ff] px-4 py-4">
            <div className="text-[22px] font-semibold leading-8 tracking-tight text-[#314158]">{title}</div>
            {subtitle ? <p className="mt-2 text-sm leading-6 text-[#6f829b]">{subtitle}</p> : null}
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#dde7f4] bg-white px-4 py-3 text-sm text-[#7b8ea8]">
            <Search className="h-4 w-4 text-[#9bb0cb]" />
            전공명, 도서명, 저자 검색
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
