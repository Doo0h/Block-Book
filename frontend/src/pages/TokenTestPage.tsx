'use client';

import { useState } from 'react';
import AdminRewardPanel from '../components/AdminRewardPanel';
import RewardTokenSection from '../components/RewardTokenSection';

export default function TokenTestPage() {
  const [studentAddress, setStudentAddress] = useState('');
  const [rewardRefreshKey, setRewardRefreshKey] = useState(0);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dfeaff_0%,#f7faff_48%,#eef4ff_100%)] px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[36px] border border-[#dbe6f5] bg-white/90 p-6 shadow-card backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#5b82df]">Reward Token</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#314158]">
                Token Test Bench
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#7b8ea8]">
                Admin reward actions and student MetaMask spend actions are separated here for development testing.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Admin Flow" value="Register + Reward" />
              <StatCard label="Student Flow" value="Connect + Spend" />
              <StatCard label="Network" value="Geth Chain 10" />
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.15fr]">
          <AdminRewardPanel
            onStudentAddressChange={setStudentAddress}
            onRewardSuccess={(address) => {
              setStudentAddress(address);
              setRewardRefreshKey((prev) => prev + 1);
            }}
          />
          <RewardTokenSection
            title="Student Spend Test"
            mode="spend"
            watchedStudentAddress={studentAddress}
            refreshKey={rewardRefreshKey}
          />
        </div>

        <div className="rounded-[28px] border border-[#dbe6f5] bg-white/85 p-5 text-sm leading-6 text-[#6f829b] shadow-card">
          Use the left panel to register or top up a student wallet. Use the right panel with MetaMask to verify balance, preview discount, and sign `spendToken`.
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-[linear-gradient(135deg,#edf5ff_0%,#f8fbff_100%)] px-4 py-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8ea8]">
        {label}
      </div>
      <div className="mt-2 text-base font-semibold text-[#314158]">{value}</div>
    </div>
  );
}
