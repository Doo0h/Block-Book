import { BrowserProvider, Contract, ethers } from 'ethers';

const BOOK_TOKEN_ABI = [
  'function balances(address) view returns (uint256)',
  'function previewDiscount(uint256 _bookPrice, uint256 _tokenAmount) view returns (uint256,uint256)',
  'function spendToken(uint256 _bookPrice, uint256 _tokenAmount, string _bookId)',
] as const;

export type EthereumProvider = {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

type EthereumError = Error & {
  code?: number;
};

export type WalletConnectionResult = {
  address: string;
  chainId: number;
};

export type NetworkCheckResult = {
  ok: boolean;
  chainId: number | null;
  message?: string;
};

export function getEthereumProvider() {
  if (typeof window === 'undefined') {
    return null;
  }

  return (window as Window & { ethereum?: EthereumProvider }).ethereum ?? null;
}

export function getExpectedChainId() {
  const rawValue = process.env.NEXT_PUBLIC_EXPECTED_CHAIN_ID;

  if (!rawValue) {
    return null;
  }

  const parsed = Number(rawValue);
  return Number.isNaN(parsed) ? null : parsed;
}

export function getExpectedRpcUrl() {
  return process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL ?? 'http://127.0.0.1:8545';
}

export function getBookTokenAddress() {
  return process.env.NEXT_PUBLIC_BOOK_TOKEN_CONTRACT_ADDRESS ?? '';
}

export function getExpectedChainName() {
  return process.env.NEXT_PUBLIC_EXPECTED_CHAIN_NAME ?? 'BlockBook Geth';
}

export function isMetaMaskInstalled() {
  return Boolean(getEthereumProvider());
}

function toHexChainId(chainId: number) {
  return `0x${chainId.toString(16)}`;
}

export async function createBrowserProvider() {
  const ethereum = getEthereumProvider();

  if (!ethereum) {
    throw new Error('MetaMask is not installed.');
  }

  return new BrowserProvider(ethereum);
}

export async function checkWalletNetwork(): Promise<NetworkCheckResult> {
  const provider = await createBrowserProvider();
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);
  const expectedChainId = getExpectedChainId();

  if (expectedChainId !== null && chainId !== expectedChainId) {
    return {
      ok: false,
      chainId,
      message: `${getExpectedChainName()} is required. Current chain ID: ${chainId}, expected chain ID: ${expectedChainId}.`,
    };
  }

  return { ok: true, chainId };
}

export async function switchOrAddExpectedNetwork() {
  const ethereum = getEthereumProvider();
  const expectedChainId = getExpectedChainId();

  if (!ethereum || expectedChainId === null) {
    return;
  }

  const hexChainId = toHexChainId(expectedChainId);

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    });
  } catch (error) {
    const ethereumError = error as EthereumError;

    if (ethereumError.code !== 4902) {
      throw error;
    }

    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: hexChainId,
          chainName: getExpectedChainName(),
          rpcUrls: [getExpectedRpcUrl()],
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
        },
      ],
    });
  }
}

export async function connectMetaMask(): Promise<WalletConnectionResult> {
  const provider = await createBrowserProvider();
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();

  return {
    address: await signer.getAddress(),
    chainId: Number(network.chainId),
  };
}

export async function getConnectedWalletAddress() {
  const ethereum = getEthereumProvider();

  if (!ethereum) {
    return null;
  }

  const accounts = await ethereum.request({ method: 'eth_accounts' });

  if (!Array.isArray(accounts) || accounts.length === 0) {
    return null;
  }

  const firstAccount = accounts[0];
  return typeof firstAccount === 'string' ? ethers.getAddress(firstAccount) : null;
}

export async function getBookTokenWriteContract() {
  const provider = await createBrowserProvider();
  const signer = await provider.getSigner();
  const contractAddress = getBookTokenAddress();

  if (!contractAddress) {
    throw new Error('NEXT_PUBLIC_BOOK_TOKEN_CONTRACT_ADDRESS is missing.');
  }

  return new Contract(contractAddress, BOOK_TOKEN_ABI, signer);
}

export function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
