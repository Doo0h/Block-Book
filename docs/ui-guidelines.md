# UI Guidelines

파랑색 기반의 미니멀 UI를 기준으로 프론트엔드 연결 시 아래 토큰을 권장합니다.

## Color Tokens

```css
:root {
  --color-primary-900: #0b2e6d;
  --color-primary-700: #0f3d91;
  --color-primary-500: #1f5fd1;
  --color-primary-100: #dce8ff;
  --color-surface: #f7faff;
  --color-card: #ffffff;
  --color-border: #d6e2f5;
  --color-text: #14213d;
  --color-muted: #5c6f91;
}
```

## Style Direction

- 상단 네비게이션은 짙은 파랑 배경과 얇은 하단 보더 사용
- 카드와 테이블은 흰 배경, 작은 radius, 매우 약한 그림자 사용
- 강조 버튼은 `--color-primary-700`, 보조 버튼은 흰 배경 + 파랑 보더 사용
- 타임라인 화면은 원형 마커와 세로 라인 위주로 단정하게 구성
- 과한 그라디언트 대신 배경에 아주 옅은 블루 톤 레이어 적용
