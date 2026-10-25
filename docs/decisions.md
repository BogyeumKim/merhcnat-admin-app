# 결정 기록

| 날짜 | 결정 | 비고 |
| --- | --- | --- |
| 2026-10 | SDK 58, UI는 `@expo/ui`, 로컬 prebuild(EAS dev build 미사용) | `AGENTS.md` |
| 2026-10 | iOS/Android 전용. web 제거. 웹 화면은 별도 React 프로젝트를 WebView로 | `docs/architecture/webview.md` |
| 2026-10 | 구조: 탭/도메인별 모듈(feature-first). FSD 미채택 | `docs/architecture/feature-first.md` |
| 2026-10 | 서버 상태 TanStack Query, UI 상태 zustand, i18n 한국어/영어 | `.claude/rules/` |
| 2026-10 | 설정 저장소는 `expo-sqlite/kv-store` 유지. **MMKV로 바꾸지 않는다** | `docs/architecture/storage-env-testing.md` |
| 2026-10 | 허용 사용자 타입 0,1,2,3,4,5,9. 타입 10은 **HTTP 200이 아닌** 별도 status로 서버가 막음 | 타입별 자기 레벨은 아래 행에서 확정 (`user-types.md`) |
| 2026-10 | 사용자 타입은 매직넘버 금지: `UserType` 상수 객체(DB 컬럼명 기반)로만 접근 | `.claude/rules/user-types.md` |
| 2026-10 | JWT, **refresh token 없음**, 앱 실행마다 로그인 필수(토큰 영속 저장 안 함), 서버가 만료 임박 시 토큰을 연장(슬라이딩) | `docs/architecture/auth-jwt.md` |
| 2026-10 | OTP 타입 0 = TOTP: **매 로그인** 서버 검증(코드 저장 안 함). 타입 1 = 문자/메일/카카오: **기기 등록·교체 시 최초 1회만** 인증(사용자가 수단 선택, 서버가 랜덤 코드 해시 저장·발송). 같은 기기 재로그인은 ID/비밀번호만 | `docs/architecture/device-binding.md`, `docs/backend-contract/auth-device.md` |
| 2026-10 | 재설치를 같은 기기로 알아본다: Android `ANDROID_ID`(서버는 해시 저장) + 설치 UUID, iOS Keychain UUID(대개 유지, 보장 불가 → 못 알아보면 재인증 폴백). IDFV는 쓰지 않음 | `device-binding.md` (스토어 정책 확인 필요) |
| 2026-10 | 한 기기 = 한 userId (1:1). 다른 계정 로그인 시 인증 후 바인딩을 덮어씀 | `auth-device.md` |
| 2026-10 | DB는 MySQL, 서버는 Spring Boot + JDK 25. API 이름·형식은 `docs/backend-contract/conventions.md`(camelCase JSON, RFC 3339, RFC 9457, `/v1` kebab-case, `Access-Token` 응답 헤더) | 서버는 추후 제작 |
| 2026-10 | HTTP 클라이언트는 전역 `fetch`(= `expo/fetch`) 얇은 래퍼 | `docs/architecture/api-conventions.md` |
| 2026-10 | 오류는 200이 아닌 status + `code`, 앱이 i18n. 점검은 `503` + 구조화 필드 | `api-conventions.md` |
| 2026-10 | 사용자 타입 표 확정: 9 VGID · 5 VID · 4 L1 · 3 L2(대리점) · 2 L3(딜러) · 1 MID · 0 사업자번호 묶음 | `docs/architecture/user-types.md` |
| 2026-10 | 루팅 탐지(freeRASP/jail-monkey)와 기기 키쌍은 우선 미구현 | 기기 바인딩은 식별자 + 서버 기준으로 설계 |
| 2026-10 | Git hooks(husky/commitlint), Unistyles 제외. Jest는 테스트할 로직이 생길 때 | `docs/reviews/reference-projects.md` |
| 2026-10 | 문자·카카오는 엠엔와이즈, 메일은 Outlook으로 발송. 서버 작업은 보류하고 앱에 집중 | `docs/backend-contract/server-stack.md` |
| 2026-10 | 새 계정은 기기 값 없음(NULL/행 없음). 비밀번호 초기화는 기기 값 유지. 기기 초기화 기능과 이전 기기 알림은 만들지 않음 | `auth-device.md` |
| 2026-10 | 푸시는 Expo Push Service 권장(Expo 앱 기본 선택, EAS 프로젝트·자격 증명 필요, 본문에 민감 정보 금지). 구현은 사용처가 정해질 때 | `device-binding.md` |
| 2026-10 | 키보드/스크롤은 `@expo/ui` 네이티브 방식(iOS SwiftUI 키보드 세이프에어리어, Android `imePadding`). `react-native-keyboard-controller`는 Android Compose 입력창을 인식하지 못해 제거 | `docs/architecture/responsive-ui.md` (기기 확인 필요) |
| 2026-10 | 시스템 글꼴 크기 추종: 문구는 RN `Text`/`NativeText`(iOS는 SwiftUI text style), `@expo/ui` Text의 `fontSize`는 iOS 고정 크기라 사용 금지 | `responsive-ui.md` |
| 2026-10 | 반응형은 창 크기 기준(600/840dp), 두 단 레이아웃, `orientation: default`. 로고는 `expo-image` + SVG(`svgVariables`) | `responsive-ui.md` |
| 2026-10 | 로그인 화면·추가 인증·점검·에러 바운더리 구현. 서버 전까지 개발용 mock(릴리스 번들에서 제거) | `docs/architecture/login-ui.md` |
| 2026-10 | 서브에이전트 리뷰(SDK 58 일치 + 성능/접근성) 반영: 토큰 수락 규칙, 세션 세대 카운터, 타임아웃 판별, 색 대비 재계산, 라벨/낭독, 자동 제출 | `docs/reviews/skill-compliance.md` |
| 2026-10 | 로고를 기존 회사 로고 정체성(빨강 #ff003a, 흰 K 원형 마크, 차콜 Kor + 빨강 pay)으로 다시 제작. 빨강은 로고/그래픽 전용, 버튼·링크는 대비를 맞춘 `action` 색 | `docs/architecture/responsive-ui.md` |
| 2026-10 | 폼은 react-hook-form + zod(`@hookform/resolvers` 5.x 고정). 검증 메시지는 코드, UI에서 번역 | `docs/architecture/feedback-ux.md` |
| 2026-10 | 토스트는 sonner-native(`shared/ui/toast.ts` 뒤). 오류는 종류별로 인라인/토스트/점검 화면으로 나눠 표시, 같은 id는 갱신 | `feedback-ux.md` |
| 2026-10 | 인라인 `style`은 성능 문제가 아님을 확인(RN 문서: StyleSheet.create는 항등 함수, React Compiler 47/47 컴파일). `npm run check:compiler`로 bail-out 점검 | `docs/architecture/styling-performance.md` |
