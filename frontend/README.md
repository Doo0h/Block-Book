# BlockBook Frontend Design

Next.js App Router + Tailwind CSS 기준의 UI 시안 컴포넌트 모음입니다.

## 포함 화면

- 랜딩 페이지
- 도서 목록 페이지
- 도서 상세 페이지
- 거래 진행 페이지
- 마이페이지

## 사용 방법

```bash
cd frontend
npm install
npm run dev
```

기본 프리뷰:

- `/` : 전체 화면 프리뷰
- `/landing`
- `/books`
- `/books/1`
- `/trades/current`
- `/mypage`

메인 엔트리는 `app/page.tsx`이며, 디자인 컴포넌트는 `src/pages`와 `src/components`에 분리되어 있습니다.
