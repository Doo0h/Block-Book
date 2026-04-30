# Block-Book
<<<<<<< HEAD
스마트 컨트랙트 에스크로와 토큰 생태계 기반 대학 중고 전공서적 거래 플랫폼
=======

스마트 컨트랙트 에스크로와 토큰 생태계 기반 대학 중고 전공서적 거래 플랫폼입니다.

## Overview

Block-Book은 대학생이 전공서적을 더 안전하게 거래할 수 있도록 설계한 서비스입니다.  
기존 중고거래의 불안 요소를 줄이기 위해 블록체인 기반 에스크로 흐름을 도입하고, 도서 거래 이력 추적과 교내 활동 기반 토큰 보상 구조를 함께 제공합니다.

## Core Features

- 스마트 컨트랙트 기반 에스크로 거래
- 도서 등록 및 전공서적 탐색
- 도서 거래 이력 타임라인
- 지갑 주소 기반 사용자 관리
- 교내 활동 참여 토큰 보상
- 학과 및 학년 기반 추천 시스템

## Tech Stack

### Backend

- Nest.js
- TypeScript
- MongoDB
- Mongoose

### Blockchain

- Ethereum
- Solidity Smart Contract
- Ethers.js

### Frontend

- Next.js
- React
- Tailwind CSS
- Lucide React

## Project Structure

```text
Block-Book/
├─ docs/                       # 기획 및 UI 문서
├─ frontend/                   # Next.js 앱 UI
│  ├─ app/
│  └─ src/
├─ src/                        # Nest.js 백엔드
│  ├─ common/
│  └─ modules/
├─ .env.example
├─ package.json
└─ README.md
```

## Implemented Screens

- 랜딩 페이지
- 도서 목록 페이지
- 도서 상세 페이지
- 거래 진행 페이지
- 마이페이지

## API Modules

- `users`
- `books`
- `trades`
- `escrow`
- `tokens`
- `recommendations`

## Run Locally

### 1. Backend

```bash
npm install
npm run dev:backend
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

루트에서 프론트만 바로 실행하려면:

```bash
npm run dev
```

## Environment Variables

루트 `.env` 예시:

```env
MONGODB_URI=mongodb://localhost:27017/blockchain-book-market
PORT=3000
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
ESCROW_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
PLATFORM_PRIVATE_KEY=replace_with_private_key
```

## Design Direction

- 파스텔 블루 기반의 미니멀 UI
- 카드형 레이아웃
- 둥근 모서리와 넓은 여백
- 블록체인 느낌은 과하지 않게, 신뢰감 중심

## Notes

- 현재 저장소에는 Nest.js 백엔드 구조와 Next.js 프론트 UI 시안이 함께 포함되어 있습니다.
- 스마트 컨트랙트 연동은 환경 변수 유무에 따라 mock transaction hash 또는 실제 RPC 호출 방식으로 동작하도록 작성되어 있습니다.

## Roadmap

- 실제 인증/인가 적용
- 스마트 컨트랙트 배포 및 ABI 분리
- 실데이터 기반 추천 로직 고도화
- 프론트와 백엔드 API 연결
- 모바일 앱 또는 PWA 전환
>>>>>>> 7728235 (Initial commit)
