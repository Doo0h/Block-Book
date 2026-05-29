'use client';

import { ethers } from 'ethers';
import { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

type AdminRewardPanelProps = {
  onStudentAddressChange?: (studentAddress: string) => void;
  onRewardSuccess?: (studentAddress: string) => void;
};

export default function AdminRewardPanel({
  onStudentAddressChange,
  onRewardSuccess,
}: AdminRewardPanelProps) {
  const [studentAddress, setStudentAddress] = useState('');
  const [studentId, setStudentId] = useState('2022810004');
  const [activityType, setActivityType] = useState('Reading challenge');
  const [rewardAmount, setRewardAmount] = useState('30');
  const [message, setMessage] = useState(
    'Register a student wallet and reward BBT using the backend admin wallet.',
  );
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);

  const handleError = async (res: Response) => {
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || data.error || 'Request failed.';

      setMessage(errorMessage);
      return null;
    }

    return data;
  };

  const parsePositiveInteger = (value: string, label: string) => {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error(`${label} must be a positive integer.`);
    }

    return parsed;
  };

  const getNormalizedStudentAddress = () => {
    const normalized = studentAddress.trim();

    if (!normalized) {
      throw new Error('Student wallet address is required.');
    }

    if (!ethers.isAddress(normalized)) {
      throw new Error('Student wallet address must be a valid Ethereum address.');
    }

    return normalized;
  };

  const updateStudentAddress = (value: string) => {
    setStudentAddress(value);
    onStudentAddressChange?.(value.trim());
  };

  const registerStudent = async () => {
    setLoading(true);
    setTxHash('');
    setMessage('Registering student wallet.');

    try {
      const normalizedStudentAddress = getNormalizedStudentAddress();
      const res = await fetch(`${API_BASE_URL}/tokens/register-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAddress: normalizedStudentAddress,
          studentId,
        }),
      });

      const data = await handleError(res);

      if (data) {
        setTxHash(data.txHash ?? '');
        setMessage(
          data.alreadyRegistered
            ? 'Student wallet is already registered.'
            : data.message ?? 'Student registration completed.',
        );
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Student registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const rewardToken = async () => {
    setLoading(true);
    setTxHash('');
    setMessage('Rewarding BBT from the backend admin wallet.');

    try {
      const normalizedStudentAddress = getNormalizedStudentAddress();
      const parsedRewardAmount = parsePositiveInteger(rewardAmount, 'Reward amount');
      const res = await fetch(`${API_BASE_URL}/tokens/reward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAddress: normalizedStudentAddress,
          amount: parsedRewardAmount,
          activityType,
          description: `${activityType} reward`,
        }),
      });

      const data = await handleError(res);

      if (data) {
        setTxHash(data.onChain?.txHash ?? '');
        setMessage(
          data.confirmed
            ? `${parsedRewardAmount} BBT rewarded successfully.`
            : data.message ??
                'Reward transaction was submitted, but the chain has not confirmed it yet.',
        );

        if (data.confirmed) {
          onRewardSuccess?.(normalizedStudentAddress);
        }
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Reward transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="rounded-[32px] border border-[#dbe6f5] bg-white p-5 shadow-card">
        <div className="mb-5">
          <p className="text-sm font-semibold text-[#5b82df]">Admin Reward</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#314158]">
            Register And Reward Student Wallet
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#7b8ea8]">
            This panel uses the backend admin wallet. It is separate from the student MetaMask spend flow.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[28px] bg-[#f7faff] p-4">
            <h3 className="text-base font-semibold text-[#314158]">Student Setup</h3>
            <div className="mt-4 space-y-3">
              <Input
                label="Student Wallet Address"
                value={studentAddress}
                onChange={updateStudentAddress}
              />
              <Input label="Student ID" value={studentId} onChange={setStudentId} />
            </div>
            <button
              type="button"
              onClick={registerStudent}
              disabled={loading}
              className="mt-4 w-full rounded-2xl border border-[#dbe6f5] bg-white px-4 py-3 text-sm font-semibold text-[#314158] transition hover:bg-[#edf5ff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Register Student
            </button>
          </div>

          <div className="rounded-[28px] bg-[#f7faff] p-4">
            <h3 className="text-base font-semibold text-[#314158]">Reward</h3>
            <div className="mt-4 space-y-3">
              <Input label="Activity" value={activityType} onChange={setActivityType} />
              <Input
                label="Reward Amount"
                value={rewardAmount}
                onChange={setRewardAmount}
                type="number"
              />
            </div>
            <button
              type="button"
              onClick={rewardToken}
              disabled={loading}
              className="mt-4 w-full rounded-2xl bg-[#5b82df] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#456fcf] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reward BBT
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-[24px] border border-[#dbe6f5] bg-[#f9fbff] p-4">
          <p className="text-sm font-medium text-[#314158]">{message}</p>
          {txHash ? (
            <p className="mt-2 break-all text-xs leading-5 text-[#7b8ea8]">
              Transaction Hash: {txHash}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-[#7b8ea8]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-2xl border border-[#dbe6f5] bg-white px-4 py-3 text-sm text-[#314158] outline-none transition focus:border-[#8fb4ff] focus:ring-2 focus:ring-[#dce9ff]"
      />
    </label>
  );
}
