import { Award, BookMarked, Coins, ShieldCheck } from 'lucide-react';
import { BlockBookShell } from '../components/blockbook-shell';
import { tokenActivities } from '../data/mock';

export function MyPage() {
  return (
    <BlockBookShell
      title="마이페이지"
      subtitle="내 도서, 거래, 보상 정보를 한 화면에서 쉽게 읽을 수 있게 배치했습니다."
      actions={
        <button className="w-full rounded-2xl bg-[#d9e8ff] px-4 py-3 text-sm font-semibold text-[#456fcf]">
          내 도서 관리
        </button>
      }
    >
      <section className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: BookMarked, label: '등록 도서', value: '12권' },
            { icon: ShieldCheck, label: '진행 거래', value: '3건' },
            { icon: Coins, label: '보유 토큰', value: '145 TOK' },
            { icon: Award, label: '이번 달 보상', value: '+50 TOK' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label} className="rounded-[28px] border border-[#dbe6f5] bg-white p-5 shadow-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#7ca1ef]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-xs text-[#94a6be]">{item.label}</div>
                <div className="mt-1 text-lg font-semibold tracking-tight text-[#314158]">{item.value}</div>
              </article>
            );
          })}
        </div>

        <section className="rounded-[32px] border border-[#dbe6f5] bg-white p-5 shadow-card">
          <div className="text-base font-semibold text-[#314158]">내 거래 현황</div>
          <div className="mt-4 space-y-3">
            {[
              ['컴퓨터구조', '판매중', '18,000원'],
              ['운영체제', '에스크로 진행중', '29,000원'],
              ['자료구조', '거래완료', '16,000원'],
            ].map(([title, status, price]) => (
              <div key={title} className="rounded-[24px] bg-[#f7faff] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[#314158]">{title}</div>
                    <div className="mt-1 text-xs text-[#7b8ea8]">{status}</div>
                  </div>
                  <div className="text-sm font-semibold text-[#314158]">{price}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-[#dbe6f5] bg-white p-5 shadow-card">
          <div className="text-base font-semibold text-[#314158]">토큰 활동</div>
          <div className="mt-4 space-y-3">
            {tokenActivities.map((activity) => (
              <div key={`${activity.title}-${activity.date}`} className="rounded-[24px] bg-[#f7faff] px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[#314158]">{activity.title}</div>
                    <div className="mt-1 text-xs text-[#94a6be]">{activity.date}</div>
                  </div>
                  <div className="text-sm font-semibold text-[#6f90e6]">{activity.amount}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </BlockBookShell>
  );
}

export default MyPage;
