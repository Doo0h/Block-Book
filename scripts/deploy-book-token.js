const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ContractFactory, JsonRpcProvider, Wallet } = require('ethers');

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const privateNetDir = path.resolve(
    projectRoot,
    '..',
    process.env.GETH_DATADIR_NAME ?? 'private_net_1337',
  );
  const contractPath = path.join(projectRoot, 'contracts', 'BookToken.sol');
  const keystoreDir = path.join(privateNetDir, 'keystore');
  const passwordPath = path.join(privateNetDir, 'password.txt');

  const source = fs.readFileSync(contractPath, 'utf8');
  const input = {
    language: 'Solidity',
    sources: {
      'BookToken.sol': {
        content: source,
      },
    },
    settings: {
      evmVersion: 'istanbul',
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode.object'],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = output.errors?.filter((error) => error.severity === 'error') ?? [];

  if (errors.length > 0) {
    throw new Error(errors.map((error) => error.formattedMessage).join('\n'));
  }

  const compiled = output.contracts['BookToken.sol'].BookToken;
  const abi = compiled.abi;
  const bytecode = `0x${compiled.evm.bytecode.object}`;

  const keystoreFile = fs
    .readdirSync(keystoreDir)
    .find((file) => file.startsWith('UTC--'));

  if (!keystoreFile) {
    throw new Error(`No geth keystore file found in ${keystoreDir}`);
  }

  const encryptedJson = fs.readFileSync(path.join(keystoreDir, keystoreFile), 'utf8');
  const password = fs.readFileSync(passwordPath, 'utf8').trim();
  const wallet = await Wallet.fromEncryptedJson(encryptedJson, password);
  const provider = new JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL ?? 'http://127.0.0.1:8545');
  const signer = wallet.connect(provider);

  console.log(`Using datadir: ${privateNetDir}`);
  console.log(`Deploying BookToken from ${signer.address}`);

  const factory = new ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy({
    gasLimit: 3000000,
  });

  console.log(`Transaction hash: ${contract.deploymentTransaction().hash}`);
  await contract.waitForDeployment();

  console.log(`BookToken deployed at: ${await contract.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
