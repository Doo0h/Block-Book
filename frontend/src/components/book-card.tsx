import { ChevronRight, ShieldCheck } from 'lucide-react';

type BookCardProps = {
  title: string;
  major: string;
  price: string;
  seller: string;
  condition: string;
};

export function BookCard({ title, major, price, seller, condition }: BookCardProps) {
  return (
    <article className="rounded-[28px] border border-[#dbe6f5] bg-white/96 p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold text-[#5b82df]">
            {major}
          </div>
          <h3 className="mt-3 text-lg font-semibold leading-7 tracking-tight text-[#314158]">{title}</h3>
          <p className="mt-1 text-sm text-[#7b8ea8]">판매자 {seller}</p>
        </div>
        <div className="rounded-2xl bg-[#f2f6fc] px-3 py-1.5 text-xs font-semibold text-[#6f829b]">{condition}</div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div>
          <div className="text-xs text-[#94a6be]">거래 희망가</div>
          <div className="mt-1 text-xl font-semibold tracking-tight text-[#314158]">{price}</div>
        </div>
        <button className="inline-flex items-center gap-1 rounded-2xl bg-[#eef4ff] px-3.5 py-2 text-sm font-semibold text-[#5b82df]">
          보기
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#f7faff] px-3 py-2 text-xs text-[#7b8ea8]">
        <ShieldCheck className="h-4 w-4 text-[#7ca1ef]" />
        에스크로 안전 거래 지원
      </div>
    </article>
  );
}
