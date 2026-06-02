# BlockBook

BlockBook은 대학생 전공서적 거래를 위한 블록체인 기반 중고 거래 프로젝트입니다. 도서 등록, 에스크로 거래, BBT 보상 토큰, 학생 지갑 기반 마이페이지를 하나의 흐름으로 연결합니다.

## 주요 기능

- MetaMask 지갑 기반 도서 등록
- Geth 사설망과 Remix/배포 스크립트를 이용한 스마트 컨트랙트 연동
- BookRegistry를 통한 온체인 도서 등록
- BookEscrow를 통한 구매 대금 예치와 수령 확인
- BookToken 기반 BBT 학생 등록, 보상 지급, 토큰 사용
- 도서 구매 시 BBT 할인 미리보기 및 사용 내역 저장
- 등록된 학생 지갑 기준 마이페이지 BBT 잔액, 누적 지급, 누적 사용, 거래 현황 표시
- Tailscale을 이용한 다른 PC와의 사설망 시연

## 기술 스택

- Backend: NestJS, TypeScript, MongoDB, Mongoose, Ethers.js
- Frontend: Next.js, React, Tailwind CSS, MetaMask
- Blockchain: Solidity, Geth private network, Remix
- Network: Tailscale

## 스마트 컨트랙트

```text
contracts/BookRegistry.sol
contracts/Escrow_scchoi.sol
contracts/BookToken.sol
```

`BookRegistry`와 `BookEscrow`는 Remix에서 배포할 수 있습니다. `BookToken`은 Solidity 0.8.20 기준으로 정리되어 있으며, Remix 배포가 불안정한 경우 아래 스크립트로 배포할 수 있습니다.

```powershell
node scripts\deploy-book-token.js
```

배포 후 나온 컨트랙트 주소는 `.env`와 `frontend/.env.local`에 반영해야 합니다.

## 환경 변수

루트 `.env` 예시:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/blockchain-book-market
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
BOOK_REGISTRY_CONTRACT_ADDRESS=0x...
ESCROW_CONTRACT_ADDRESS=0x...
BOOK_TOKEN_CONTRACT_ADDRESS=0x...
PLATFORM_WALLET_ADDRESS=0x...
PLATFORM_PRIVATE_KEY=replace_with_private_key
```

프론트 `frontend/.env.local` 예시:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_EXPECTED_CHAIN_ID=1337
NEXT_PUBLIC_EXPECTED_CHAIN_NAME=BlockBook
NEXT_PUBLIC_BOOK_TOKEN_CONTRACT_ADDRESS=0x...
```

Tailscale로 다른 PC와 시연할 때는 `localhost` 대신 관리자 PC의 Tailscale IP를 사용합니다.

```env
NEXT_PUBLIC_API_BASE_URL=http://100.xxx.xxx.xxx:3000/api
NEXT_PUBLIC_BLOCKCHAIN_RPC_URL=http://100.xxx.xxx.xxx:8545
```

## Geth 사설망 실행

관리자 PC에서 Geth 사설망을 실행하고 채굴을 켜야 합니다.

```powershell
cd C:\Users\SAMSUNG\OneDrive\Desktop\blockbook

geth --datadir private_net_1337 --networkid 1337 --http --http.addr 127.0.0.1 --http.port 8545 --http.api eth,net,web3,personal,miner --http.corsdomain "*" --http.vhosts "*" --allow-insecure-unlock --unlock 0x관리자지갑주소 --password private_net_1337/password.txt --mine --miner.etherbase 0x관리자지갑주소
```

Tailscale을 통해 외부 PC와 시연할 때는 `--http.addr`을 관리자 PC의 Tailscale IP로 바꿉니다.

```powershell
geth --datadir private_net_1337 --networkid 1337 --http --http.addr 100.xxx.xxx.xxx --http.port 8545 --http.api eth,net,web3,personal,miner --http.corsdomain "*" --http.vhosts "*" --authrpc.addr 100.xxx.xxx.xxx --authrpc.port 8551 --allow-insecure-unlock --unlock 0x관리자지갑주소 --password private_net_1337/password.txt --mine --miner.etherbase 0x관리자지갑주소
```

상태 확인:

```powershell
geth attach http://127.0.0.1:8545
```

```javascript
eth.chainId()
eth.mining
eth.blockNumber
miner.start(1)
```

`0x539`는 chain ID 1337을 의미합니다.

## 백엔드 실행

```powershell
cd C:\Users\SAMSUNG\OneDrive\Desktop\blockbook\Block-Book-github
npm install
npm run start:dev
```

기본 API 주소:

```text
http://localhost:3000/api
```

주요 API:

```text
GET  /api/books/on-chain
POST /api/books/on-chain
GET  /api/books/wallet/status
GET  /api/escrow/on-chain/list
POST /api/escrow/on-chain/lock
POST /api/escrow/on-chain/:tradeId/confirm
POST /api/tokens/register-student
POST /api/tokens/reward
GET  /api/tokens/student/:studentAddress
GET  /api/tokens/preview-discount
```

## 프론트엔드 실행

```powershell
cd C:\Users\SAMSUNG\OneDrive\Desktop\blockbook\Block-Book-github
npm --prefix frontend install
npm --prefix frontend run dev -- -p 3001
```

다른 PC에서 접속하게 하려면 다음처럼 실행합니다.

```powershell
npm --prefix frontend run dev -- -H 0.0.0.0 -p 3001
```

접속 주소:

```text
http://localhost:3001
http://localhost:3001/books
http://localhost:3001/books/register
http://localhost:3001/token-test
http://localhost:3001/mypage
```

## 사용 흐름

1. 관리자 PC에서 Geth, 백엔드, 프론트를 실행합니다.
2. MetaMask에 BlockBook 네트워크를 추가합니다.
3. 판매자는 `/books/register`에서 도서 ID, 제목, 저자, 가격, 상태를 입력하고 등록합니다.
4. 관리자는 `/token-test`에서 학생 지갑을 등록하고 BBT를 지급합니다.
5. 학생은 `/mypage`에서 등록된 지갑의 BBT 잔액과 거래 정보를 확인합니다.
6. 학생은 `/books`에서 사용할 BBT 수량을 입력하고 할인 미리보기 후 구매합니다.
7. 구매자는 수령 후 `/books`에서 수령 확인을 진행합니다.

## Tailscale 시연

관리자 PC의 Tailscale IP가 `100.79.164.110`이라면 상대방은 다음 주소로 접속합니다.

```text
http://100.79.164.110:3001
```

상대방 MetaMask 네트워크:

```text
Network Name: BlockBook
RPC URL: http://100.79.164.110:8545
Chain ID: 1337
Currency Symbol: ETH
```

상대방 PC에는 DB나 백엔드가 필요하지 않습니다. 브라우저, MetaMask, Tailscale만 있으면 됩니다.

## 참고

- `.env`, `frontend/.env.local`, geth 데이터, node_modules는 Git에 올리지 않습니다.
- 다른 체인 ID로 새 사설망을 만들면 컨트랙트 주소는 다시 배포해야 합니다.
- MetaMask pending이 오래 지속되면 geth 콘솔에서 `miner.start(1)`을 실행합니다.
