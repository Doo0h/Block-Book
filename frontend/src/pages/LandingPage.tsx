<<<<<<< Updated upstream
import { BookOpen, Coins, ShieldCheck } from 'lucide-react';
import { BlockBookShell } from '../components/blockbook-shell';
=======
import { BookOpen, CalendarRange, Coins, Gift, ShieldCheck } from 'lucide-react';
import { BookCard } from '../components/book-card';
import { BlockBookShell } from '../components/blockbook-shell';
import { featuredBooks, ongoingEvents } from '../data/mock';
>>>>>>> Stashed changes

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
    description: '교내 활동 참여로 받은 토큰을 혜택에 사용할 수 있습니다.',
  },
];

export function LandingPage() {
  return (
    <BlockBookShell
<<<<<<< Updated upstream
      title="전공서적 거래를 더 안전하고 간단하게"
      subtitle="BlockBook은 대학생을 위한 전공서적 거래 앱입니다. 신뢰 가능한 거래 흐름과 쉬운 탐색 경험에 집중했습니다."
=======
      title="BlockBook 홈"
      subtitle="진행 중인 행사와 인기 전공서적을 한 번에 확인하세요."
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
>>>>>>> Stashed changes
    >
      <section className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[28px] border border-[#deebfb] bg-white/90 px-4 py-4 shadow-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#7ca1ef]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="mt-4 text-lg font-semibold text-[#314158]">1.2K</div>
            <div className="mt-1 text-xs text-[#7b8ea8]">등록 도서</div>
          </div>
          <div className="rounded-[28px] border border-[#deebfb] bg-white/90 px-4 py-4 shadow-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#7ca1ef]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="mt-4 text-lg font-semibold text-[#314158]">97%</div>
            <div className="mt-1 text-xs text-[#7b8ea8]">안전 거래</div>
          </div>
          <div className="rounded-[28px] border border-[#deebfb] bg-white/90 px-4 py-4 shadow-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#7ca1ef]">
              <Coins className="h-5 w-5" />
            </div>
            <div className="mt-4 text-lg font-semibold text-[#314158]">18K</div>
            <div className="mt-1 text-xs text-[#7b8ea8]">보상 토큰</div>
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
<<<<<<< Updated upstream
=======

        <section className="rounded-[32px] border border-[#dbe6f5] bg-white p-5 shadow-card">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm font-semibold text-[#7ca1ef]">진행 중인 행사</div>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-[#314158]">참여하고 토큰 받기</h3>
            </div>
            <button className="text-sm font-semibold text-[#7b8ea8]">전체</button>
          </div>

          <div className="mt-4 space-y-3">
            {ongoingEvents.map((event) => (
              <article key={event.id} className="rounded-[24px] border border-[#e3ecf8] bg-[#f7faff] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-base font-semibold tracking-tight text-[#314158]">{event.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-[#7b8ea8]">{event.description}</p>
                  </div>
                  <div className="rounded-2xl bg-[#d9e8ff] px-3 py-2 text-xs font-semibold text-[#466fcb]">
                    {event.reward}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 text-xs text-[#7b8ea8]">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5">
                    <CalendarRange className="h-3.5 w-3.5 text-[#7ca1ef]" />
                    {event.period}
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5">
                    <Gift className="h-3.5 w-3.5 text-[#7ca1ef]" />
                    {event.host}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

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
>>>>>>> Stashed changes
      </section>
    </BlockBookShell>
  );
}
