# API Sample Payloads

## 회원가입

`POST /api/users/signup`

```json
{
  "name": "Kim Student",
  "email": "student@example.com",
  "password": "pass1234",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "department": "Computer Science",
  "grade": 3
}
```

## 도서 등록

`POST /api/books`

```json
{
  "title": "Operating Systems",
  "author": "Abraham Silberschatz",
  "isbn": "9781119456339",
  "major": "Computer Science",
  "price": 25000,
  "condition": "GOOD",
  "sellerId": "USER_OBJECT_ID",
  "tags": ["os", "core", "system"],
  "description": "Clean notes, no torn pages"
}
```

## 거래 생성

`POST /api/trades`

```json
{
  "bookId": "BOOK_OBJECT_ID",
  "buyerId": "USER_OBJECT_ID",
  "offeredPrice": 24000,
  "pickupLocation": "Engineering Building Lobby"
}
```

## 에스크로 Lock

`POST /api/escrow/lock`

```json
{
  "tradeId": "TRADE_OBJECT_ID"
}
```
