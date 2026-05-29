import { BookOpen, Coins, ShieldCheck } from 'lucide-react';
import { BlockBookShell } from '../components/blockbook-shell';

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
      title="전공서적 거래를 더 안전하고 간단하게"
      subtitle="BlockBook은 대학생을 위한 전공서적 거래 앱입니다. 신뢰 가능한 거래 흐름과 쉬운 탐색 경험에 집중했습니다."
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
      </section>
    </BlockBookShell>
  );
}

export default LandingPage;
