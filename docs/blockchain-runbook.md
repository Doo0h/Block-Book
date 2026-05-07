# BlockBook Blockchain Runbook

## 1. Geth private network

Open a terminal at:

```bat
cd C:\Users\SAMSUNG\OneDrive\Desktop\blockbook
```

Start Geth:

```bat
geth --networkid 10 --nodiscover --datadir private_net --http --http.addr "127.0.0.1" --http.port "8545" --http.corsdomain "https://remix.ethereum.org" --http.vhosts "*" --http.api "eth,net,web3,personal" --allow-insecure-unlock --unlock "0x33d33143fa9e807C05FD65f2843fFC4546536A0c" --password private_net\password.txt console
```

In the Geth console:

```js
miner.setEtherbase("0x33d33143fa9e807C05FD65f2843fFC4546536A0c")
miner.start(1)
```

Check status:

```js
eth.blockNumber
eth.getBalance("0x33d33143fa9e807C05FD65f2843fFC4546536A0c")
```

Stop mining when needed:

```js
miner.stop()
```

## 2. Remix deploy

1. Open `https://remix.ethereum.org`.
2. Upload or paste `contracts/BookRegistry.sol`.
3. In Solidity Compiler, use compiler `0.8.19`.
4. Compile `BookRegistry.sol`.
5. In Deploy & Run Transactions, set Environment to `Custom - External HTTP Provider`.
6. Provider URL:

```text
http://127.0.0.1:8545
```

7. Confirm account is:

```text
0x33d33143fa9e807C05FD65f2843fFC4546536A0c
```

8. Deploy `BookRegistry`.
9. Copy the deployed contract address.

Current deployed address:

```env
BOOK_REGISTRY_CONTRACT_ADDRESS=0x4a0C9630c731455Da9C6a9f7dBe4B62A2afd0708
```

## 3. Backend env

Edit `Block-Book-github/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/blockchain-book-market
PORT=3000
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
BOOK_REGISTRY_CONTRACT_ADDRESS=0x4a0C9630c731455Da9C6a9f7dBe4B62A2afd0708
ESCROW_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
PLATFORM_WALLET_ADDRESS=0x33d33143fa9e807C05FD65f2843fFC4546536A0c
PLATFORM_PRIVATE_KEY=replace_with_private_key
```

## 4. Backend start

Open another terminal:

```bat
cd C:\Users\SAMSUNG\OneDrive\Desktop\blockbook\Block-Book-github
npx tsc -p tsconfig.build.json
node dist/main.js
```

Backend URL:

```text
http://localhost:3000/api
```

Quick API test:

```bat
curl -X POST http://localhost:3000/api/books/on-chain ^
-H "Content-Type: application/json" ^
-d "{\"id\":101,\"title\":\"Operating System Concepts\",\"author\":\"Abraham Silberschatz\",\"status\":\"GOOD\"}"
```

Do not reuse the same `id`. The contract rejects duplicate book ids.

## 5. Frontend start

Open another terminal:

```bat
cd C:\Users\SAMSUNG\OneDrive\Desktop\blockbook\Block-Book-github\frontend
npm run dev -- -p 3001
```

Frontend URL:

```text
http://localhost:3001/books
```

Example form input:

```text
_id: 102
_title: Operating System Concepts
_author: Abraham Silberschatz
_status: GOOD
```

After registration, copy `Book ID` and check it in Remix:

```text
Deployed Contracts > BookRegistry > books
```

Enter the book id, for example `102`.
