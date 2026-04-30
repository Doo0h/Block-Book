import { BookOpen, Coins, ShieldCheck } from 'lucide-react';
import { BookCard } from '../components/book-card';
import { BlockBookShell } from '../components/blockbook-shell';
import { featuredBooks } from '../data/mock';

const features = [
  {
    icon: ShieldCheck,
    title: '안전한 에스크로 거래',
    description: '결제 금액을 먼저 잠그고 수령 확인 후 정산합니다.',
  },
  {
    icon: BookOpen,
    title: '도서 이력 타임라인',
    description: '거래 과정을 단계별로 확인할 수 있습니다.',
  },
  {
    icon: Coins,
    title: '토큰 보상',
    description: '교내 활동 참여로 받은 토큰을 혜택에 사용합니다.',
  },
];

export function LandingPage() {
  return (
    <BlockBookShell
      title="전공서적 거래를 더 안전하고 간단하게"
      subtitle="BlockBook은 대학생을 위한 전공서적 거래 앱입니다. 신뢰 가능한 거래 흐름과 쉬운 탐색 경험에 집중했습니다."
      actions={
        <div className="grid grid-cols-2 gap-3">
          <button className="rounded-2xl bg-[#bdd6ff] px-4 py-3 text-sm font-semibold text-[#466fcb]">
            책 찾기
          </button>
          <button className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#6d84b4] shadow-card">
            책 등록
          </button>
        </div>
      }
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
            복잡한 기술 설명보다 거래 흐름이 명확하게 보이도록 설계한 앱형 첫 화면입니다.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-[#deebfb] bg-white/80 px-3 py-4">
              <div className="text-lg font-semibold">1.2K</div>
              <div className="mt-1 text-xs text-[#7b8ea8]">등록 도서</div>
            </div>
            <div className="rounded-2xl border border-[#deebfb] bg-white/80 px-3 py-4">
              <div className="text-lg font-semibold">97%</div>
              <div className="mt-1 text-xs text-[#7b8ea8]">안전 거래</div>
            </div>
            <div className="rounded-2xl border border-[#deebfb] bg-white/80 px-3 py-4">
              <div className="text-lg font-semibold">18K</div>
              <div className="mt-1 text-xs text-[#7b8ea8]">보상 토큰</div>
            </div>
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

        <section className="rounded-[32px] border border-[#dbe6f5] bg-white p-5 shadow-card">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm font-semibold text-[#7ca1ef]">인기 도서</div>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-[#314158]">이번 주 많이 찾는 책</h3>
            </div>
            <button className="text-sm font-semibold text-[#7b8ea8]">전체</button>
          </div>
          <div className="mt-4 space-y-4">
            {featuredBooks.map((book) => (
              <BookCard key={book.id} {...book} />
            ))}
          </div>
        </section>
      </section>
    </BlockBookShell>
  );
}
