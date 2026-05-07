'use client';

import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { BlockBookShell } from '../components/blockbook-shell';

type RegisterBookResponse = {
  blockchainBookId?: number;
  title?: string;
  author?: string;
  status?: string;
  blockchainTxHash?: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

const statusOptions = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'];

export function RegisterBookPage() {
  const [form, setForm] = useState({ id: '', title: '', author: '', status: 'GOOD' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<RegisterBookResponse | null>(null);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => form.id && form.title && form.author && form.status, [form]);

  const updateForm = (name: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submitBook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult(null);
    setError('');

    try {
      const response = await fetch(`${apiBaseUrl}/books/on-chain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Number(form.id),
          title: form.title,
          author: form.author,
          status: form.status,
        }),
      });

      const data = (await response.json()) as RegisterBookResponse & { message?: string | string[] };

      if (!response.ok) {
        const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(message || 'Book registration failed.');
      }

      setResult(data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Book registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BlockBookShell
      title="책 등록"
      subtitle="BookRegistry.registerBook에 들어갈 값을 입력합니다."
      showBackButton
      actions={
        <button
          form="book-register-form"
          disabled={!canSubmit || isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#bdd6ff] px-4 py-3 text-sm font-semibold text-[#466fcb] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          블록체인에 등록
        </button>
      }
    >
      <section className="space-y-4">
        <form
          id="book-register-form"
          onSubmit={submitBook}
          className="space-y-4 rounded-[28px] border border-[#dbe6f5] bg-white p-4 shadow-card"
        >
          <div>
            <div className="text-sm font-semibold text-[#314158]">Solidity 입력값</div>
            <div className="mt-1 text-xs text-[#7b8ea8]">_id, _title, _author, _status만 사용합니다.</div>
          </div>

          <input
            value={form.id}
            onChange={(event) => updateForm('id', event.target.value)}
            placeholder="_id 예: 102"
            inputMode="numeric"
            className="w-full rounded-2xl border border-[#dbe6f5] bg-[#f7faff] px-4 py-3 text-sm outline-none focus:border-[#8fb4ff]"
          />
          <input
            value={form.title}
            onChange={(event) => updateForm('title', event.target.value)}
            placeholder="_title 예: Operating System Concepts"
            className="w-full rounded-2xl border border-[#dbe6f5] bg-[#f7faff] px-4 py-3 text-sm outline-none focus:border-[#8fb4ff]"
          />
          <input
            value={form.author}
            onChange={(event) => updateForm('author', event.target.value)}
            placeholder="_author 예: Abraham Silberschatz"
            className="w-full rounded-2xl border border-[#dbe6f5] bg-[#f7faff] px-4 py-3 text-sm outline-none focus:border-[#8fb4ff]"
          />
          <select
            value={form.status}
            onChange={(event) => updateForm('status', event.target.value)}
            className="w-full rounded-2xl border border-[#dbe6f5] bg-[#f7faff] px-4 py-3 text-sm outline-none focus:border-[#8fb4ff]"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </form>

        {result ? (
          <div className="rounded-[28px] border border-[#cde8da] bg-[#f5fffa] p-4 shadow-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#246b45]">
              <CheckCircle2 className="h-4 w-4" />
              등록 완료
            </div>
            <div className="mt-3 space-y-2 break-all text-xs leading-5 text-[#426554]">
              <div>Book ID: {result.blockchainBookId}</div>
              <div>Title: {result.title}</div>
              <div>Author: {result.author}</div>
              <div>Status: {result.status}</div>
              <div>Tx Hash: {result.blockchainTxHash || 'No contract transaction'}</div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[28px] border border-[#f2c8c8] bg-[#fff6f6] p-4 text-sm leading-6 text-[#a34b4b]">
            {error}
          </div>
        ) : null}
      </section>
    </BlockBookShell>
  );
}
