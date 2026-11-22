# 문서 인덱스

SDK 58 변경 로그(2026-10-15 릴리스)를 이 프로젝트 관점으로 정리한 문서 트리.
원문: https://expo.dev/changelog/sdk-58

```
docs/
├── README.md                    # 이 파일
├── expo-sdk-58/
│   ├── overview.md              # 버전/요구사항/플랫폼 변경 요약
│   ├── expo-ui.md               # @expo/ui 변경점과 사용 지침
│   ├── expo-router.md           # Router 안정화/마이그레이션
│   ├── breaking-changes.md      # 깨지는 변경 + 폐기 API 체크리스트
│   ├── tooling.md               # CLI, 에이전트 도구, 빌드/개발 서버
│   └── packages.md              # 개별 패키지 변경 (필요 시 참조)
├── architecture/
│   ├── feature-first.md         # 탭/도메인별 모듈 구조와 규칙
│   ├── data-fetching.md         # TanStack Query 패턴 (UI/서비스 분리)
│   ├── user-types.md            # 사용자 타입별 UI 설계와 레거시 코드 분석
│   ├── auth-jwt.md              # JWT(refresh 없음, 슬라이딩) 설계
│   ├── device-binding.md        # 기기 바인딩 / 추가 인증 설계
│   ├── api-conventions.md       # 오류 응답 형식, HTTP 클라이언트
│   ├── webview.md               # WebView 전략과 웹↔앱 계약 초안
│   ├── responsive-ui.md         # 반응형·시스템 글꼴·키보드·로고(SVG)
│   ├── login-ui.md              # 로그인/추가 인증 UI, 개발용 mock 시나리오
│   ├── feedback-ux.md           # 폼(react-hook-form), 오류 표시 정책, 토스트
│   ├── styling-performance.md   # 인라인 style vs StyleSheet, React Compiler 점검
│   ├── storage-env-testing.md   # 저장소/환경변수/테스트 조사
│   ├── home-menu.md             # 홈/전체메뉴/탭 구성, capability
│   └── notice-popup.md          # 로그인 후 공지 팝업
├── decisions.md                 # 결정 기록
├── backend-contract/
│   ├── app-migration-server-login.md  # ★ 실제 로그인/OTP/기기 계약 (앱이 따름)
│   ├── home-summary.md          # 홈 요약 API
│   ├── notice-popup.md          # 공지 팝업 API
│   └── server-stack.md          # Spring Boot/JDK 25, TOTP·메일·문자·알림톡
└── migration/
    └── mms-mobile.md            # 레거시 앱 분석과 Expo 이전 메모
```

## 현재 프로젝트 기준선 (`package.json`)

| 항목 | 버전 |
| --- | --- |
| expo | ~58.0.26 |
| @expo/ui | ~58.0.29 |
| expo-router | ~58.0.32 |
| react-native | 0.88.1 |
| react / react-dom | 19.3.0 |
| react-native-reanimated / worklets | 4.7.1 / 0.13.0 |
| typescript | ~6.0.3 |

`app.json`: `platforms: ["ios", "android"]` (web 제거), `experiments.typedRoutes`, `experiments.reactCompiler` 활성.
