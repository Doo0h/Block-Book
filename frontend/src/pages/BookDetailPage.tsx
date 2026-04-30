import { Clock3, MapPin, ShieldCheck, Star } from 'lucide-react';
import { BlockBookShell } from '../components/blockbook-shell';

export function BookDetailPage() {
  return (
    <BlockBookShell
      title="도서 상세"
      subtitle="정보를 많이 쌓기보다 핵심 구매 판단 정보만 먼저 보여주는 구조입니다."
      showBackButton
      actions={
        <button className="w-full rounded-2xl bg-[#bdd6ff] px-4 py-3 text-sm font-semibold text-[#466fcb]">
          거래 시작하기
        </button>
      }
    >
      <section className="space-y-4">
        <div className="rounded-[32px] border border-[#dbe6f5] bg-white p-5 shadow-card">
          <div className="h-52 rounded-[28px] bg-[linear-gradient(180deg,#eef5ff_0%,#f8fbff_100%)]" />
          <div className="mt-5 inline-flex rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold text-[#5b82df]">
            컴퓨터공학과
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#314158]">Operating System Concepts</h2>
          <p className="mt-2 text-sm leading-6 text-[#7b8ea8]">
            필기 흔적이 적고 전반적인 보관 상태가 좋은 전공서입니다.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              ['가격', '29,000원'],
              ['상태', '상'],
              ['저자', 'A. Silberschatz'],
              ['ISBN', '9781119456339'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-[#f7faff] px-4 py-4">
                <div className="text-xs text-[#94a6be]">{label}</div>
                <div className="mt-1.5 text-sm font-semibold text-[#314158]">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-[#dbe6f5] bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-[#314158]">판매자 정보</div>
              <div className="mt-1 text-sm text-[#7b8ea8]">신뢰도 높은 캠퍼스 사용자</div>
            </div>
            <Star className="h-5 w-5 text-[#7ca1ef]" />
          </div>
          <div className="mt-4 space-y-3">
            {[
              ['판매자', '김민수'],
              ['학과', '컴퓨터공학과'],
              ['거래 성공률', '98%'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-[#f7faff] px-4 py-3">
                <span className="text-sm text-[#7b8ea8]">{label}</span>
                <span className="text-sm font-semibold text-[#314158]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-[#dbe6f5] bg-white p-5 shadow-card">
          <div className="text-base font-semibold text-[#314158]">거래 안내</div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 rounded-2xl bg-[#f7faff] px-4 py-3 text-sm text-[#6f829b]">
              <ShieldCheck className="h-4 w-4 text-[#7ca1ef]" />
              에스크로 기반 안전 거래
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-[#f7faff] px-4 py-3 text-sm text-[#6f829b]">
              <Clock3 className="h-4 w-4 text-[#9bb0cb]" />
              거래 생성 후 단계별 상태 확인 가능
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-[#f7faff] px-4 py-3 text-sm text-[#6f829b]">
              <MapPin className="h-4 w-4 text-[#9bb0cb]" />
              교내 직거래 위치 협의 가능
            </div>
          </div>
        </div>
      </section>
    </BlockBookShell>
  );
}
