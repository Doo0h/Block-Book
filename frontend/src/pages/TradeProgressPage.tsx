import { CheckCircle2, LockKeyhole } from 'lucide-react';
import { BlockBookShell } from '../components/blockbook-shell';
import RewardTokenSection from '../components/RewardTokenSection';
import { tradeTimeline } from '../data/mock';

const escrowInfo = [
  ['거래 금액', '29,000원'],
  ['컨트랙트 상태', 'Locked'],
  ['구매자 지갑', '0x91c4...A023'],
  ['판매자 지갑', '0x4Fb2...88Cd'],
] as const;

export function TradeProgressPage() {
  return (
    <BlockBookShell
      title="거래 진행 상태"
      subtitle="현재 어느 단계인지 바로 확인할 수 있도록 거래 흐름을 순서대로 정리했습니다."
      showBackButton
      actions={
        <button className="w-full rounded-2xl bg-[#bdd6ff] px-4 py-3 text-sm font-semibold text-[#466fcb]">
          거래 확인하기
        </button>
      }
    >
      <section className="space-y-4">
        <div className="rounded-[32px] border border-[#dbe6f5] bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-[#314158]">
                Operating System Concepts
              </div>
              <div className="mt-1 text-sm text-[#7b8ea8]">
                에스크로 Lock 완료
              </div>
            </div>
            <div className="rounded-2xl bg-[#eef4ff] px-3 py-2 text-xs font-semibold text-[#5b82df]">
              진행중
            </div>
          </div>

          <div className="mt-5 space-y-5">
            {tradeTimeline.map((item, index) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      item.done
                        ? 'bg-[#bcd4ff] text-[#456fcf]'
                        : 'bg-[#f2f6fc] text-[#9bb0cb]'
                    }`}
                  >
                    {item.done ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </div>
                  {index < tradeTimeline.length - 1 ? (
                    <div className="mt-2 h-16 w-px bg-[#dbe6f5]" />
                  ) : null}
                </div>
                <div className="flex-1 rounded-[24px] bg-[#f7faff] px-4 py-4">
                  <div className="text-sm font-semibold text-[#314158]">
                    {item.step}
                  </div>
                  <div className="mt-1 text-sm leading-6 text-[#7b8ea8]">
                    {item.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-[#dbe6f5] bg-white p-5 shadow-card">
          <div className="flex items-center gap-2 text-base font-semibold text-[#314158]">
            <LockKeyhole className="h-4 w-4 text-[#7ca1ef]" />
            에스크로 정보
          </div>
          <div className="mt-4 space-y-3">
            {escrowInfo.map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-[#f7faff] px-4 py-3">
                <div className="text-xs text-[#94a6be]">{label}</div>
                <div className="mt-1.5 text-sm font-semibold text-[#314158]">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <RewardTokenSection
          title="Trade Discount With BBT"
          defaultBookId="BOOK-OS-001"
          defaultBookPrice="29000"
          mode="spend"
        />
      </section>
    </BlockBookShell>
  );
}

export default TradeProgressPage;
