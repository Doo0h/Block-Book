'use client';

import { useEffect, useState } from 'react';
import {
  checkWalletNetwork,
  connectMetaMask,
  getBookTokenWriteContract,
  getConnectedWalletAddress,
  getEthereumProvider,
  getExpectedChainId,
  getExpectedChainName,
  isMetaMaskInstalled,
  shortenAddress,
  switchOrAddExpectedNetwork,
} from '../lib/metamask';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

type RewardTokenSectionProps = {
  className?: string;
  defaultBookId?: string;
  defaultBookPrice?: string;
  title?: string;
  mode?: 'full' | 'spend';
  watchedStudentAddress?: string;
  refreshKey?: number;
};

type StudentInfoResponse = {
  registered: boolean;
  studentAddress: string;
  balance: string;
  totalEarned: string;
  totalSpent: string;
  lastUpdated: string;
};

export default function RewardTokenSection({
  className = '',
  defaultBookId = 'BOOK001',
  defaultBookPrice = '15000',
  title = 'Reward Token',
  mode = 'full',
  watchedStudentAddress = '',
  refreshKey = 0,
}: RewardTokenSectionProps) {
  const [walletAddress, setWalletAddress] = useState('');
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState('0');
  const [rewardAmount, setRewardAmount] = useState('30');
  const [activityType, setActivityType] = useState('Reading challenge');
  const [studentId, setStudentId] = useState('2022810004');
  const [isStudentRegistered, setIsStudentRegistered] = useState(false);
  const [bookId, setBookId] = useState(defaultBookId);
  const [bookPrice, setBookPrice] = useState(defaultBookPrice);
  const [tokenAmount, setTokenAmount] = useState('20');
  const [discount, setDiscount] = useState('0');
  const [finalPrice, setFinalPrice] = useState(defaultBookPrice);
  const [message, setMessage] = useState('Connect MetaMask to test BBT balance, reward, discount, and spend.');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [isWalletReady, setIsWalletReady] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState<boolean | null>(null);

  const expectedChainId = getExpectedChainId();
  const expectedChainName = getExpectedChainName();
  const isAdminMode = mode === 'full';

  const clearTransactionInfo = () => {
    setTxHash('');
  };

  const parsePositiveInteger = (value: string, label: string) => {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 0) {
      throw new Error(`${label} must be a non-negative integer.`);
    }

    return parsed;
  };

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

  const loadStudentInfo = async (address: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/tokens/student/${address}`, {
        cache: 'no-store',
      });
      const data = (await handleError(res)) as StudentInfoResponse | null;

      if (!data) {
        return;
      }

      setIsStudentRegistered(Boolean(data.registered));
      setBalance(data.balance ?? '0');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load student info.');
    }
  };

  const refreshWalletState = async () => {
    if (hasMetaMask !== true) {
      setWalletAddress('');
      setChainId(null);
      setIsWalletReady(false);
      setIsStudentRegistered(false);
      return;
    }

    const connectedAddress = await getConnectedWalletAddress();

    if (!connectedAddress) {
      setWalletAddress('');
      setChainId(null);
      setBalance('0');
      setIsWalletReady(false);
      setIsStudentRegistered(false);
      return;
    }

    const network = await checkWalletNetwork();
    setWalletAddress(connectedAddress);
    setChainId(network.chainId);
    setIsWalletReady(network.ok);

    if (!network.ok && network.message) {
      setMessage(network.message);
    }

    await loadStudentInfo(connectedAddress);
  };

  const getBalance = async (targetAddress?: string) => {
    const address = targetAddress ?? walletAddress;

    if (!address) {
      setMessage('Connect a wallet first.');
      return;
    }

    setLoading(true);
    clearTransactionInfo();
    setMessage('Loading BBT balance for the connected wallet.');

    try {
      const res = await fetch(`${API_BASE_URL}/tokens/balance/${address}`, {
        cache: 'no-store',
      });
      const data = await handleError(res);

      if (data) {
        setBalance(data.balance ?? '0');
        setMessage('Balance loaded.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load balance.');
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    if (hasMetaMask !== true) {
      setMessage('MetaMask is not installed.');
      return;
    }

    setLoading(true);
    clearTransactionInfo();
    setMessage('Connecting MetaMask.');

    try {
      await switchOrAddExpectedNetwork();
      const { address, chainId: connectedChainId } = await connectMetaMask();
      setWalletAddress(address);
      setChainId(connectedChainId);

      const network = await checkWalletNetwork();
      setIsWalletReady(network.ok);

      if (!network.ok) {
        setMessage(
          network.message ??
            `${expectedChainName} is required before token actions can run.`,
        );
        return;
      }

      await loadStudentInfo(address);
      await getBalance(address);
      setMessage(`Wallet connected: ${shortenAddress(address)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to connect MetaMask.');
    } finally {
      setLoading(false);
    }
  };

  const registerStudent = async () => {
    if (!walletAddress) {
      setMessage('Connect a wallet before registering the student.');
      return;
    }

    setLoading(true);
    clearTransactionInfo();
    setMessage('Registering the connected wallet as a student.');

    try {
      const res = await fetch(`${API_BASE_URL}/tokens/register-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAddress: walletAddress,
          studentId,
        }),
      });

      const data = await handleError(res);

      if (data) {
        setIsStudentRegistered(true);
        setTxHash(data.txHash ?? '');
        setMessage(data.alreadyRegistered ? 'Student is already registered.' : 'Student registration completed.');
        await loadStudentInfo(walletAddress);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Student registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const rewardToken = async () => {
    if (!walletAddress) {
      setMessage('Connect a wallet first.');
      return;
    }

    if (!isStudentRegistered) {
      setMessage('Register the connected wallet as a student before rewarding tokens.');
      return;
    }

    setLoading(true);
    clearTransactionInfo();
    setMessage('Sending reward token transaction from the backend admin wallet.');

    try {
      const parsedRewardAmount = parsePositiveInteger(rewardAmount, 'Reward amount');
      const res = await fetch(`${API_BASE_URL}/tokens/reward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user',
          studentAddress: walletAddress,
          amount: parsedRewardAmount,
          activityType,
          description: `${activityType} reward`,
        }),
      });

      const data = await handleError(res);

      if (data) {
        setTxHash(data.onChain?.txHash ?? '');
        setMessage(`${parsedRewardAmount} BBT rewarded to the connected wallet.`);
        await loadStudentInfo(walletAddress);
        await getBalance(walletAddress);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Reward transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  const previewDiscount = async () => {
    setLoading(true);
    clearTransactionInfo();
    setMessage('Calculating token discount.');

    try {
      const parsedBookPrice = parsePositiveInteger(bookPrice, 'Book price');
      const parsedTokenAmount = parsePositiveInteger(tokenAmount, 'Token amount');
      const res = await fetch(
        `${API_BASE_URL}/tokens/preview-discount?bookPrice=${parsedBookPrice}&tokenAmount=${parsedTokenAmount}`,
        { cache: 'no-store' },
      );
      const data = await handleError(res);

      if (data) {
        setDiscount(data.discountWon ?? '0');
        setFinalPrice(data.finalPrice ?? String(parsedBookPrice));
        setMessage('Discount preview loaded.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Discount preview failed.');
    } finally {
      setLoading(false);
    }
  };

  const useToken = async () => {
    if (!walletAddress) {
      setMessage('Connect a wallet first.');
      return;
    }

    if (!isStudentRegistered) {
      setMessage('Register the connected wallet as a student before spending tokens.');
      return;
    }

    if (!isWalletReady) {
      setMessage(
        `${expectedChainName} must be selected in MetaMask${
          expectedChainId !== null ? ` (chain ID ${expectedChainId})` : ''
        }.`,
      );
      return;
    }

    setLoading(true);
    clearTransactionInfo();
    setMessage('Waiting for MetaMask signature for spendToken.');

    try {
      const parsedBookPrice = parsePositiveInteger(bookPrice, 'Book price');
      const parsedTokenAmount = parsePositiveInteger(tokenAmount, 'Token amount');
      const contract = await getBookTokenWriteContract();
      const tx = await contract.spendToken(
        BigInt(parsedBookPrice),
        BigInt(parsedTokenAmount),
        bookId,
      );

      setTxHash(tx.hash ?? '');
      setMessage('Transaction submitted. Waiting for confirmation.');

      const receipt = await tx.wait();
      setTxHash(receipt?.hash ?? tx.hash ?? '');
      setMessage(`${parsedTokenAmount} BBT spent from the connected wallet.`);
      await loadStudentInfo(walletAddress);
      await getBalance(walletAddress);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Token spend failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setHasMetaMask(isMetaMaskInstalled());
  }, []);

  useEffect(() => {
    if (hasMetaMask === null) {
      return;
    }

    void refreshWalletState();

    const ethereum = getEthereumProvider();

    if (!ethereum?.on) {
      return;
    }

    const handleAccountsChanged = () => {
      void refreshWalletState();
    };

    const handleChainChanged = () => {
      void refreshWalletState();
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      ethereum.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [hasMetaMask]);

  const walletLabel = walletAddress ? shortenAddress(walletAddress) : 'Not connected';
  const canSpend = Boolean(walletAddress) && isStudentRegistered && isWalletReady && !loading;
  const normalizedWatchedStudentAddress = watchedStudentAddress.trim().toLowerCase();
  const normalizedWalletAddress = walletAddress.trim().toLowerCase();
  const isWatchingSameStudent =
    Boolean(normalizedWatchedStudentAddress) &&
    normalizedWatchedStudentAddress === normalizedWalletAddress;

  useEffect(() => {
    if (!refreshKey || !walletAddress || !isWatchingSameStudent) {
      return;
    }

    void loadStudentInfo(walletAddress);
    void getBalance(walletAddress);
    setMessage('Rewarded wallet matched the connected MetaMask account. Balance refreshed.');
  }, [refreshKey, walletAddress, isWatchingSameStudent]);

  return (
    <section className={className}>
      <div className="rounded-[32px] border border-[#dbe6f5] bg-white p-5 shadow-card">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#5b82df]">Reward Token</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#314158]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#7b8ea8]">
              {isAdminMode
                ? 'Use MetaMask to connect a wallet, register it as a student, reward BBT, preview discounts, and sign spend transactions directly.'
                : 'Use MetaMask to connect a wallet, check BBT balance, preview the discount, and sign spend transactions directly.'}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[240px]">
            <button
              type="button"
              onClick={connectWallet}
              disabled={loading}
              className="rounded-2xl bg-[#314158] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#233245] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {walletAddress ? 'Reconnect Wallet' : 'Connect Wallet'}
            </button>
            <button
              type="button"
              onClick={() => void getBalance()}
              disabled={loading || !walletAddress}
              className="rounded-2xl border border-[#dbe6f5] bg-[#f9fbff] px-4 py-3 text-sm font-semibold text-[#456fcf] transition hover:bg-[#edf5ff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Refresh Balance
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {hasMetaMask === false ? (
            <div className="rounded-[24px] border border-[#ffd9b3] bg-[#fff7ed] p-4 text-sm text-[#9a4d00]">
              MetaMask is not installed. Install the extension before testing wallet actions.
            </div>
          ) : null}

          <div className="rounded-[28px] bg-[linear-gradient(135deg,#edf5ff_0%,#f8fbff_100%)] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8ea8]">
                  Wallet Balance
                </div>
                <div className="mt-3 text-3xl font-semibold tracking-tight text-[#314158]">
                  {balance}
                  <span className="ml-2 text-base font-medium text-[#7b8ea8]">BBT</span>
                </div>
              </div>

              <div className="rounded-2xl bg-white/80 px-4 py-3 text-xs text-[#5b6f8d]">
                <div>Status: {walletAddress ? 'Connected' : 'Disconnected'}</div>
                <div>Wallet: {walletLabel}</div>
                <div>Chain ID: {chainId ?? '-'}</div>
                <div>Student: {isStudentRegistered ? 'Registered' : 'Not registered'}</div>
                <div>Network: {isWalletReady ? 'Ready' : walletAddress ? 'Wrong network' : '-'}</div>
              </div>
            </div>

            <p className="mt-4 break-all text-xs leading-5 text-[#8fa0b7]">
              {walletAddress || 'No wallet connected.'}
            </p>
            {watchedStudentAddress ? (
              <p className="mt-2 break-all text-xs leading-5 text-[#5b6f8d]">
                Last admin target: {watchedStudentAddress}
              </p>
            ) : null}
            {walletAddress && !isWalletReady ? (
              <p className="mt-2 text-xs leading-5 text-[#c05621]">
                Switch MetaMask to {expectedChainName}
                {expectedChainId !== null ? ` (chain ID ${expectedChainId})` : ''}.
              </p>
            ) : null}
            {watchedStudentAddress && walletAddress && !isWatchingSameStudent ? (
              <p className="mt-2 text-xs leading-5 text-[#c05621]">
                Admin rewarded a different wallet. Switch MetaMask to the same student address to see the updated BBT balance here.
              </p>
            ) : null}
          </div>

          <div className={`grid gap-4 ${isAdminMode ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
            {isAdminMode ? (
              <div className="rounded-[28px] bg-[#f7faff] p-4">
                <h3 className="text-base font-semibold text-[#314158]">Student Setup</h3>

                <div className="mt-4 space-y-3">
                  <Input label="Student ID" value={studentId} onChange={setStudentId} />
                </div>

                <button
                  type="button"
                  onClick={registerStudent}
                  disabled={loading || !walletAddress}
                  className="mt-4 w-full rounded-2xl border border-[#dbe6f5] bg-white px-4 py-3 text-sm font-semibold text-[#314158] transition hover:bg-[#edf5ff] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Register Connected Wallet
                </button>
              </div>
            ) : null}

            {isAdminMode ? (
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
                  disabled={loading || !walletAddress || !isStudentRegistered}
                  className="mt-4 w-full rounded-2xl bg-[#5b82df] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#456fcf] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reward BBT
                </button>
              </div>
            ) : null}

            <div className="rounded-[28px] bg-[#f7faff] p-4">
              <h3 className="text-base font-semibold text-[#314158]">Book Discount</h3>

              <div className="mt-4 space-y-3">
                <Input label="Book ID" value={bookId} onChange={setBookId} />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Book Price"
                    value={bookPrice}
                    onChange={setBookPrice}
                    type="number"
                  />
                  <Input
                    label="Token Amount"
                    value={tokenAmount}
                    onChange={setTokenAmount}
                    type="number"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MetricCard label="Discount" value={`${discount} KRW`} />
                <MetricCard label="Final Price" value={`${finalPrice} KRW`} accent />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={previewDiscount}
                  disabled={loading}
                  className="flex-1 rounded-2xl border border-[#dbe6f5] bg-white px-3 py-3 text-sm font-semibold text-[#5b6f8d] transition hover:bg-[#edf5ff] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={useToken}
                  disabled={!canSpend}
                  className="flex-1 rounded-2xl bg-[#314158] px-3 py-3 text-sm font-semibold text-white transition hover:bg-[#233245] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Spend Token
                </button>
              </div>
              {!isStudentRegistered ? (
                <p className="mt-3 text-xs leading-5 text-[#c05621]">
                  This wallet must already be registered by an administrator before BBT can be used.
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#dbe6f5] bg-[#f9fbff] p-4">
            <p className="text-sm font-medium text-[#314158]">{message}</p>
            {txHash ? (
              <p className="mt-2 break-all text-xs leading-5 text-[#7b8ea8]">
                Transaction Hash: {txHash}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-xs text-[#94a6be]">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${accent ? 'text-[#456fcf]' : 'text-[#314158]'}`}>
        {value}
      </p>
    </div>
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
