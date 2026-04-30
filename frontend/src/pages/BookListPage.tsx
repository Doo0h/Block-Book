import { SlidersHorizontal } from 'lucide-react';
import { BookCard } from '../components/book-card';
import { BlockBookShell } from '../components/blockbook-shell';
import { featuredBooks } from '../data/mock';

const filters = ['컴퓨터공학', '전자공학', '경영학', '에스크로 가능', '판매중'];

export function BookListPage() {
  return (
    <BlockBookShell
      title="도서 찾기"
      subtitle="학과별 전공서적을 빠르게 탐색할 수 있는 목록 화면입니다."
      actions={
        <button className="w-full rounded-2xl bg-[#bdd6ff] px-4 py-3 text-sm font-semibold text-[#466fcb]">
          도서 등록하기
        </button>
      }
    >
      <section className="space-y-4">
        <div className="rounded-[28px] border border-[#dbe6f5] bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-[#314158]">필터</div>
              <div className="mt-1 text-xs text-[#7b8ea8]">가독성을 위해 자주 쓰는 조건만 노출</div>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#6f829b]">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                className="rounded-full border border-[#dbe6f5] bg-[#f7faff] px-3 py-2 text-xs font-medium text-[#6f829b]"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#dbe6f5] bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-[#314158]">검색 결과 128권</div>
              <div className="mt-1 text-xs text-[#7b8ea8]">최신 등록순</div>
            </div>
            <button className="rounded-2xl bg-[#eef4ff] px-3 py-2 text-xs font-semibold text-[#6f829b]">정렬</button>
          </div>
        </div>

        <div className="space-y-4">
          {[...featuredBooks, ...featuredBooks].map((book, index) => (
            <BookCard key={`${book.id}-${index}`} {...book} />
          ))}
        </div>
      </section>
    </BlockBookShell>
  );
}
