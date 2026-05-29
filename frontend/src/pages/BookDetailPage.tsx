import { Clock3, MapPin, ShieldCheck, Star } from 'lucide-react';
import { BlockBookShell } from '../components/blockbook-shell';
import RewardTokenSection from '../components/RewardTokenSection';

export function BookDetailPage() {
  return (
    <BlockBookShell
      title="Book Detail"
      subtitle="Review the book, seller information, and BBT discount flow before starting the trade."
      showBackButton
      actions={
        <button className="w-full rounded-2xl bg-[#bdd6ff] px-4 py-3 text-sm font-semibold text-[#466fcb]">
          Start Trade
        </button>
      }
    >
      <section className="space-y-4">
        <div className="rounded-[32px] border border-[#dbe6f5] bg-white p-5 shadow-card">
          <div className="h-52 rounded-[28px] bg-[linear-gradient(180deg,#eef5ff_0%,#f8fbff_100%)]" />
          <div className="mt-5 inline-flex rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold text-[#5b82df]">
            Computer Science
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#314158]">
            Operating System Concepts
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#7b8ea8]">
            Clean copy with light highlights. Useful sample listing for verifying the token discount flow.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              ['Price', '29,000 KRW'],
              ['Condition', 'Good'],
              ['Author', 'A. Silberschatz'],
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
              <div className="text-base font-semibold text-[#314158]">Seller</div>
              <div className="mt-1 text-sm text-[#7b8ea8]">Sample profile used for the trade preview.</div>
            </div>
            <Star className="h-5 w-5 text-[#7ca1ef]" />
          </div>
          <div className="mt-4 space-y-3">
            {[
              ['Name', 'Kim Min-su'],
              ['Department', 'Computer Science'],
              ['Trade Rating', '98%'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-[#f7faff] px-4 py-3">
                <span className="text-sm text-[#7b8ea8]">{label}</span>
                <span className="text-sm font-semibold text-[#314158]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-[#dbe6f5] bg-white p-5 shadow-card">
          <div className="text-base font-semibold text-[#314158]">Trade Notes</div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 rounded-2xl bg-[#f7faff] px-4 py-3 text-sm text-[#6f829b]">
              <ShieldCheck className="h-4 w-4 text-[#7ca1ef]" />
              Escrow-backed transfer for safer transactions.
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-[#f7faff] px-4 py-3 text-sm text-[#6f829b]">
              <Clock3 className="h-4 w-4 text-[#9bb0cb]" />
              Track each step on the trade progress screen.
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-[#f7faff] px-4 py-3 text-sm text-[#6f829b]">
              <MapPin className="h-4 w-4 text-[#9bb0cb]" />
              Meetup location can be negotiated after escrow confirmation.
            </div>
          </div>
        </div>

        <RewardTokenSection
          title="Book Discount With BBT"
          defaultBookId="BOOK-OS-001"
          defaultBookPrice="29000"
          mode="spend"
        />
      </section>
    </BlockBookShell>
  );
}

export default BookDetailPage;
