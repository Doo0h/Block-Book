'use client';

import { useState } from 'react';
import { CheckCircle2, LockKeyhole, X } from 'lucide-react';
import { BlockBookShell } from '../components/blockbook-shell';
import { tradeTimeline as initialTimeline } from '../data/mock';

export function TradeProgressPage() {
  const [timeline, setTimeline] = useState(initialTimeline);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [tradeStatus, setTradeStatus] = useState('에스크로 Lock 완료');
  const [contractStatus, setContractStatus] = useState('Locked');

  const isConfirmed = timeline[2].done;

  const handleConfirmClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    setIsConfirming(true);
    // 스마트 컨트랙트 트랜잭션 시뮬레이션 (1.5초 딜레이)
    setTimeout(() => {
      setTimeline((prev) => {
        const newTimeline = [...prev];
        newTimeline[2] = { ...newTimeline[2], done: true, detail: '도서 수령이 확인되었습니다.' };
        newTimeline[3] = { ...newTimeline[3], done: true, detail: '판매자에게 에스크로 금액이 정산되었습니다.' };
        return newTimeline;
      });
      setTradeStatus('에스크로 정산 완료');
      setContractStatus('Released');
      setIsConfirming(false);
      setIsModalOpen(false);
    }, 1500);
  };

  return (
    <>
      <BlockBookShell
        title="거래 진행 상태"
        subtitle="Operating System Concepts (Abraham Silberschatz 지음 | 10판)"
        showBackButton
        actions={
          <button
            onClick={isConfirmed ? undefined : handleConfirmClick}
            disabled={isConfirmed}
            className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${isConfirmed
                ? 'bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed'
                : 'bg-[#bdd6ff] text-[#466fcb] active:bg-[#a5c5f8] shadow-sm'
              }`}
          >
            {isConfirmed ? '수령 확인 완료' : '수령 확인하기'}
          </button>
        }
      >
        <section className="space-y-4">
          <div className="rounded-[32px] border border-[#dbe6f5] bg-white p-5 shadow-card transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold leading-snug text-[#314158]">
                  Operating System Concepts (Abraham Silberschatz 지음 | 10판)
                </div>
                <div className="mt-1 text-sm text-[#7b8ea8] transition-colors">{tradeStatus}</div>
              </div>
              <div
                className={`rounded-2xl px-3 py-2 text-xs font-semibold transition-colors ${isConfirmed ? 'bg-[#e6f4ea] text-[#1e8e3e]' : 'bg-[#eef4ff] text-[#5b82df]'
                  }`}
              >
                {isConfirmed ? '거래완료' : '진행중'}
              </div>
            </div>

            <div className="mt-5 space-y-5">
              {timeline.map((item, index) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-500 ${item.done ? 'bg-[#bcd4ff] text-[#456fcf]' : 'bg-[#f2f6fc] text-[#9bb0cb]'
                        }`}
                    >
                      {item.done ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-sm">{index + 1}</span>}
                    </div>
                    {index < timeline.length - 1 ? (
                      <div
                        className={`mt-2 h-16 w-px transition-colors duration-500 ${timeline[index + 1].done ? 'bg-[#bcd4ff]' : 'bg-[#dbe6f5]'
                          }`}
                      />
                    ) : null}
                  </div>
                  <div
                    className={`flex-1 rounded-[24px] px-4 py-4 transition-colors duration-500 ${item.done ? 'bg-[#f0f5ff]' : 'bg-[#f7faff]'
                      }`}
                  >
                    <div className="text-sm font-semibold text-[#314158]">{item.step}</div>
                    <div className="mt-1 text-sm leading-6 text-[#7b8ea8]">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#dbe6f5] bg-white p-5 shadow-card transition-all duration-300">
            <div className="flex items-center gap-2 text-base font-semibold text-[#314158]">
              <LockKeyhole className="h-4 w-4 text-[#7ca1ef]" />
              에스크로 정보
            </div>
            <div className="mt-4 space-y-3">
              {[
                ['거래 금액', '29,000원'],
                ['컨트랙트 상태', contractStatus],
                ['구매자 지갑', '0x91c4...A023'],
                ['판매자 지갑', '0x4Fb2...88Cd'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-[#f7faff] px-4 py-3 transition-colors">
                  <div className="text-xs text-[#94a6be]">{label}</div>
                  <div
                    className={`mt-1.5 text-sm font-semibold transition-colors ${label === '컨트랙트 상태' && isConfirmed ? 'text-[#1e8e3e]' : 'text-[#314158]'
                      }`}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </BlockBookShell>

      {/* 수령 확인 모달 (Escrow Confirm Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-sm scale-100 rounded-[32px] bg-white p-6 shadow-2xl transition-transform">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#314158]">도서 수령 확인</h3>
              <button
                onClick={() => !isConfirming && setIsModalOpen(false)}
                className="rounded-full p-1 text-[#94a6be] transition-colors hover:bg-[#f2f6fc] hover:text-[#314158]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-[#fff5f5] p-4 text-sm leading-relaxed text-[#c53030]">
              <span className="font-bold">주의:</span> 수령 확인 시 에스크로 스마트 컨트랙트에 예치된 금액이
              <span className="font-bold underline underline-offset-2"> 즉시 판매자에게 정산</span>됩니다.
            </div>

            <p className="mt-4 text-sm text-[#7b8ea8]">
              실제로 도서를 문제없이 안전하게 전달받으셨나요? 확인 후에는 거래를 취소할 수 없습니다.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isConfirming}
                className="flex-1 rounded-2xl bg-[#f2f6fc] py-3.5 text-sm font-semibold text-[#6f829b] transition-colors active:bg-[#e2e8f0] disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                disabled={isConfirming}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#466fcb] py-3.5 text-sm font-semibold text-white transition-colors active:bg-[#3b5ba5] disabled:opacity-80"
              >
                {isConfirming ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    컨트랙트 처리 중...
                  </>
                ) : (
                  '수령 확정'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
