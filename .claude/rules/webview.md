---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# WebView 규칙

근거와 계약 초안: `docs/architecture/webview.md`

- 데이터 화면(가맹점, 거래내역, 정산 등)은 별도 React 웹 프로젝트를 `react-native-webview`로 연다. 이 저장소에 웹 코드를 두지 않는다. 설치는 `npx expo install react-native-webview`.
- 로그인/OTP/생체인증/카메라 결제는 **네이티브**로 유지한다. 로그인을 WebView 안에서 하지 않는다.
- WebView 컴포넌트는 `shared/ui/web-screen`에 한 개만 두고 모든 웹 화면이 이를 거친다 (오류 처리, 허용 도메인, 브리지를 한 곳에서 관리).
- `originWhitelist`는 허용 도메인으로만 좁힌다 (기본값 `*` 금지). 네비게이션도 허용 목록 밖이면 막는다.
- 웹 → 네이티브 메시지(`onMessage`)는 **출처가 보장되지 않는다.** 타입이 있는 메시지 스키마로 검증하고, 모르는 메시지는 버린다.
- 토큰을 URL 쿼리스트링에 넣지 않는다. 전달은 헤더 또는 로드 후 검증된 출처에만 주입한다.
- `onError`/`onHttpError` 시 빈 화면을 두지 않는다: 네이티브 오류 화면 + 재시도 + 오류 리포팅.
- 웹이 보내는 사용자 타입/권한 값을 신뢰하지 않는다. 데이터 범위는 서버가 토큰으로 결정한다.
