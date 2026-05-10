'use client';

import { ExternalLink, Loader2, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BlockBookShell } from '../components/blockbook-shell';

type OnChainBook = {
  _id: string;
  blockchainBookId: number;
  title: string;
  author: string;
  status: string;
  blockchainTxHash?: string;
  ownerAddress?: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

export function BookListPage() {
  const [books, setBooks] = useState<OnChainBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/books/on-chain`, { cache: 'no-store' });
        const data = (await response.json()) as OnChainBook[] | { message?: string };

        if (!response.ok) {
          throw new Error(Array.isArray(data) ? 'Failed to load books.' : data.message || 'Failed to load books.');
        }

        setBooks(Array.isArray(data) ? data : []);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Failed to load books.');
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, []);

  const normalizedKeyword = keyword.trim().toLowerCase();
  const filteredBooks = normalizedKeyword
    ? books.filter((book) =>
        [
          String(book.blockchainBookId),
          book.title,
          book.author,
          book.status,
          book.ownerAddress ?? '',
          book.blockchainTxHash ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedKeyword),
      )
    : books;

  return (
    <BlockBookShell
      title="도서"
      subtitle="BookRegistry에 등록한 도서 정보를 확인합니다."
      actions={
        <Link
          href="/books/register"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#bdd6ff] px-4 py-3 text-sm font-semibold text-[#466fcb]"
        >
          <Plus className="h-4 w-4" />
          책 등록
        </Link>
      }
    >
      <section className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-[#dde7f4] bg-white px-4 py-3 text-sm text-[#7b8ea8] shadow-card">
          <Search className="h-4 w-4 text-[#9bb0cb]" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Book ID, 도서명, 저자, 상태 검색"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#314158] outline-none placeholder:text-[#9bb0cb]"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-[28px] border border-[#dbe6f5] bg-white p-8 text-[#6f829b] shadow-card">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            불러오는 중
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[28px] border border-[#f2c8c8] bg-[#fff6f6] p-4 text-sm leading-6 text-[#a34b4b]">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && books.length === 0 ? (
          <div className="rounded-[28px] border border-[#dbe6f5] bg-white p-5 text-sm leading-6 text-[#6f829b] shadow-card">
            아직 등록된 도서가 없습니다. 아래 책 등록 버튼으로 첫 도서를 등록하세요.
          </div>
        ) : null}

        {!isLoading && !error && books.length > 0 && filteredBooks.length === 0 ? (
          <div className="rounded-[28px] border border-[#dbe6f5] bg-white p-5 text-sm leading-6 text-[#6f829b] shadow-card">
            검색 결과가 없습니다.
          </div>
        ) : null}

        {filteredBooks.map((book) => (
          <article key={book._id} className="rounded-[28px] border border-[#dbe6f5] bg-white p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[#7ca1ef]">BOOK #{book.blockchainBookId}</div>
                <h2 className="mt-1 text-lg font-semibold leading-7 text-[#314158]">{book.title}</h2>
                <div className="mt-1 text-sm text-[#7b8ea8]">{book.author}</div>
              </div>
              <div className="rounded-2xl bg-[#eef4ff] px-3 py-2 text-xs font-semibold text-[#466fcb]">
                {book.status}
              </div>
            </div>

            <div className="mt-4 space-y-2 break-all rounded-2xl bg-[#f7faff] p-3 text-xs leading-5 text-[#6f829b]">
              <div>Owner: {book.ownerAddress || '-'}</div>
              <div>Tx: {book.blockchainTxHash || '-'}</div>
            </div>

            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#5b82df]">
              <ExternalLink className="h-3.5 w-3.5" />
              Remix books({book.blockchainBookId})에서 온체인 값 확인
            </div>
          </article>
        ))}
      </section>
    </BlockBookShell>
  );
}
