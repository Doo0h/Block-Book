export const featuredBooks = [
  {
    id: 1,
    title: 'Operating System Concepts',
    major: '컴퓨터공학과',
    price: '29,000원',
    seller: '김민수',
    condition: '상',
  },
  {
    id: 2,
    title: '전자회로의 이해',
    major: '전자공학과',
    price: '18,000원',
    seller: '이서연',
    condition: '중상',
  },
  {
    id: 3,
    title: '거시경제학',
    major: '경제학과',
    price: '22,000원',
    seller: '박지훈',
    condition: '상',
  },
];

export const tradeTimeline = [
  { step: '거래 생성', detail: '구매자가 거래를 생성했습니다.', done: true },
  { step: '에스크로 Lock', detail: '스마트 컨트랙트에 거래 금액이 예치되었습니다.', done: true },
  { step: '도서 전달 확인', detail: '구매자가 수령 확인을 기다리는 중입니다.', done: false },
  { step: '정산 완료', detail: '확인 후 판매자에게 금액이 전달됩니다.', done: false },
];

export const tokenActivities = [
  { title: '블록체인 세미나 참여', amount: '+30 TOK', date: '2026.04.28' },
  { title: '학과 멘토링 참여', amount: '+20 TOK', date: '2026.04.18' },
  { title: '도서 할인 쿠폰 사용', amount: '-15 TOK', date: '2026.04.10' },
];
