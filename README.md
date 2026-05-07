# Block-Book

블록체인 기반 대학 중고 전공서적 거래 프로젝트입니다.  
현재 `dooyoung` 브랜치에서는 Remix로 배포한 `BookRegistry.sol`을 Geth 사설망에 연결하고, 프론트에서 입력한 도서 정보를 백엔드가 컨트랙트에 기록하는 흐름을 사용합니다.

## 핵심 흐름

```text
프론트 /books/register
→ POST /api/books/on-chain
→ NestJS 백엔드
→ Geth RPC http://127.0.0.1:8545
→ BookRegistry.registerBook(...)
→ /books에서 등록된 도서 확인
```

## 기술 스택

- Backend: NestJS, TypeScript, MongoDB, Mongoose
- Frontend: Next.js, React, Tailwind CSS
- Blockchain: Solidity, Geth private network, Remix, Ethers.js

## 1. Geth 사설망 실행

터미널을 열고 프로젝트 상위 폴더로 이동합니다.

```bat
cd C:\Users\SAMSUNG\OneDrive\Desktop\blockbook
```

Geth를 실행합니다.

```bat
geth --networkid 10 --nodiscover --datadir private_net --http --http.addr "127.0.0.1" --http.port "8545" --http.corsdomain "https://remix.ethereum.org" --http.vhosts "*" --http.api "eth,net,web3,personal" --allow-insecure-unlock --unlock "0x33d33143fa9e807C05FD65f2843fFC4546536A0c" --password private_net\password.txt console
```

Geth 콘솔에서 채굴 계정을 지정하고 채굴을 시작합니다.

```js
miner.setEtherbase("0x33d33143fa9e807C05FD65f2843fFC4546536A0c")
miner.start(1)
```

상태 확인:

```js
eth.blockNumber
eth.getBalance("0x33d33143fa9e807C05FD65f2843fFC4546536A0c")
```

채굴을 멈추고 싶을 때:

```js
miner.stop()
```

## 2. Remix에서 BookRegistry 배포

1. `https://remix.ethereum.org` 접속
2. `contracts/BookRegistry.sol` 파일 업로드 또는 내용 붙여넣기
3. Solidity Compiler 버전 `0.8.19` 선택
4. `BookRegistry.sol` 컴파일
5. Deploy & Run Transactions에서 Environment를 `Custom - External HTTP Provider`로 선택
6. Provider URL 입력

```text
http://127.0.0.1:8545
```

7. Account가 아래 주소인지 확인

```text
0x33d33143fa9e807C05FD65f2843fFC4546536A0c
```

8. `BookRegistry` Deploy
9. Deployed Contracts에 나온 컨트랙트 주소를 `.env`에 입력

현재 사용 중인 배포 주소:

```env
BOOK_REGISTRY_CONTRACT_ADDRESS=0x4a0C9630c731455Da9C6a9f7dBe4B62A2afd0708
```

## 3. 백엔드 환경 변수

`Block-Book-github/.env` 예시:

```env
MONGODB_URI=mongodb://localhost:27017/blockchain-book-market
PORT=3000
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
BOOK_REGISTRY_CONTRACT_ADDRESS=0x4a0C9630c731455Da9C6a9f7dBe4B62A2afd0708
ESCROW_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
PLATFORM_WALLET_ADDRESS=0x33d33143fa9e807C05FD65f2843fFC4546536A0c
PLATFORM_PRIVATE_KEY=replace_with_private_key
```

## 4. 백엔드 실행

다른 터미널에서 실행합니다.

```bat
cd C:\Users\SAMSUNG\OneDrive\Desktop\blockbook\Block-Book-github
npx tsc -p tsconfig.build.json
node dist/main.js
```

백엔드 주소:

```text
http://localhost:3000/api
```

도서 온체인 등록 API:

```text
POST /api/books/on-chain
```

등록된 온체인 도서 목록 API:

```text
GET /api/books/on-chain
```

지갑 상태 확인 API:

```text
GET /api/books/wallet/status
```

API 테스트:

```bat
curl -X POST http://localhost:3000/api/books/on-chain ^
-H "Content-Type: application/json" ^
-d "{\"id\":101,\"title\":\"Operating System Concepts\",\"author\":\"Abraham Silberschatz\",\"status\":\"GOOD\"}"
```

주의: `id`는 중복되면 안 됩니다. 같은 `id`를 다시 등록하면 컨트랙트에서 `Book already exists`로 실패합니다.

## 5. 프론트 실행

프론트는 백엔드와 포트가 겹치지 않게 `3001`로 실행합니다.

```bat
cd C:\Users\SAMSUNG\OneDrive\Desktop\blockbook\Block-Book-github\frontend
npm run dev -- -p 3001
```

프론트 주소:

```text
http://localhost:3001/books
```

## 6. 프론트 사용 방법

### 책 등록

```text
http://localhost:3001/books/register
```

예시 입력값:

```text
_id: 102
_title: Operating System Concepts
_author: Abraham Silberschatz
_status: GOOD
```

등록 성공 시 화면에 `Book ID`, `Title`, `Author`, `Status`, `Tx Hash`가 표시됩니다.

### 등록된 도서 확인

```text
http://localhost:3001/books
```

도서 페이지에서 등록된 도서 목록을 확인할 수 있습니다.  
검색창에는 `Book ID`, 도서명, 저자, 상태값을 입력해 등록된 도서를 찾을 수 있습니다.

### 지갑 상태 확인

상단 `지갑` 버튼을 누르면 다음 정보를 확인할 수 있습니다.

- 연결 상태
- 플랫폼 지갑 주소
- 잔액
- Chain ID
- 현재 블록 번호
- RPC 주소
- BookRegistry 컨트랙트 주소

## 7. Remix에서 등록값 확인

프론트에서 등록한 뒤 나온 `Book ID`를 Remix에서 조회합니다.

```text
Deployed Contracts
→ BookRegistry
→ books
→ Book ID 입력
```

예를 들어 `Book ID`가 `102`이면 `books(102)`를 조회합니다.

컨트랙트에 저장되는 구조:

```solidity
struct Book {
    string title;
    string author;
    string currentStatus;
    address currentOwner;
    uint lastPrice;
    uint lastUpdated;
    bool exists;
}
```

현재 `registerBook`에서는 프론트 입력값 중 `_id`, `_title`, `_author`, `_status`를 사용합니다.  
`currentOwner`는 트랜잭션을 보낸 백엔드 플랫폼 지갑 주소로 저장되고, `lastUpdated`는 블록 타임스탬프로 저장됩니다.

## 추가 문서

더 짧은 실행 순서는 아래 문서에도 정리되어 있습니다.

```text
docs/blockchain-runbook.md
```
