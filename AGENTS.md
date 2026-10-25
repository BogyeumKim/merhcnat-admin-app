# korpay-merchant-admin

Expo **SDK 58** (React Native 0.88, React 19.3) 모바일 앱. UI는 **`@expo/ui`** 를 기본으로 사용한다.
모바일 우선, 성능을 우선한다. 대상 플랫폼은 **iOS/Android뿐**이다 (web 미사용). 데이터가 많은 화면은 별도 React 웹 프로젝트를 WebView로 연다.

## 문서를 신뢰하는 순서

Expo는 SDK마다 breaking change가 있으므로 기억(학습 데이터)에 의존하지 않는다.

1. 이 저장소의 `docs/expo-sdk-58/` (SDK 58 변경 로그 정리본)
2. `https://docs.expo.dev/versions/v58.0.0/` (버전 고정 문서)
3. `https://docs.expo.dev/llms.txt` (전체 색인)
4. 설치된 expo skills (`expo-ui`, `expo-router`, `expo-native-ui`, `expo-design-system` 등)

## 명령어

`package-lock.json`이 있으므로 npm 기준.

```bash
npx expo install <package>   # 항상 이것으로 설치 (SDK 호환 버전 해석)
npx expo start               # 개발 서버
npx expo lint                # 린트
npx tsc --noEmit             # 타입체크
npx expo-doctor              # 의존성/설정 진단
npx expo install --fix       # 호환되지 않는 버전 수정
```

작업 완료 선언 전에 **lint + typecheck**를 실행한다.

## 구조 요약 (탭/도메인별 모듈, feature-first)

- `src/app/`(Expo Router 라우트, 얇게) · `src/core/`(providers, navigation) · `src/features/<탭/도메인>/{api,queries,mutations,components,screens,model}` · `src/shared/`
- 의존 방향 `app → core → features → shared`. 다른 feature는 그 feature의 `index.ts`로만 import (ESLint 강제). 상세: `docs/architecture/feature-first.md`
- 서버 상태: TanStack Query. UI는 화면 동작(toast/이동)을 `UseMutationCallback`으로 넘기고, 서비스 훅은 캐시만 다룬다. 클라이언트 UI 상태(모달 등): zustand. 상세: `docs/architecture/data-fetching.md`, `.claude/rules/zustand.md`
- 사용자 타입(0, 1, 2, 3, 4, 5, 9)별 UI 차이는 capability 맵으로 처리하고, 코드에서 타입 숫자를 직접 쓰지 않는다(`UserType` 상수). 상세: `docs/architecture/user-types.md`
- 인증: JWT, refresh token 없음, 앱 실행마다 로그인(토큰 영속 저장 금지). 상세 `docs/architecture/auth-jwt.md`, `device-binding.md`, `api-conventions.md`
- UI는 `@expo/ui`(네이티브 스크롤·키보드). 반응형/시스템 글꼴/키보드/로고 규칙: `docs/architecture/responsive-ui.md`, `.claude/rules/responsive-ui.md`. 폼/오류 표시/토스트: `docs/architecture/feedback-ux.md`, `.claude/rules/feedback-ux.md`
- 가맹점/거래내역 등 데이터 화면은 WebView. 상세: `docs/architecture/webview.md`. 이전 대상 앱 분석: `docs/migration/mms-mobile.md`
- 별칭 `@/*` → `./src/*`, `@/assets/*` → `./assets/*`
- `ios/`, `android/`는 CNG로 생성됨. 직접 만들거나 수정하지 않는다. `app.json`과 config plugin으로 설정한다.
- **개발은 로컬 prebuild 기준**: `npx expo prebuild` → `npx expo run:ios` / `run:android`. EAS development build는 쓰지 않는다. `ios/`, `android/`는 gitignore 대상이며 생성물이다.
- (배경) SDK 58용 스토어 Expo Go는 2026-10 현재 출시 전(체인지로그: "within a few weeks")이고, 출시 후에도 SDK 58만 지원하며 운영 앱 개발 환경으로 권장되지 않는다.
- 하단 탭: iOS `NativeTabs`(Liquid Glass), Android Compose 플로팅 바. 규칙은 `.claude/rules/bottom-tabs.md`.

## 자동 강제 (hooks, lint)

- `.claude/hooks/`: 억제 주석(`eslint-disable`, `@ts-ignore`) 쓰기 차단, 훅 우회 플래그 차단(commit/push), 코드 편집 후 `eslint --fix` + 남은 문제 보고.
- `eslint.config.js`: `any`/non-null 금지, import 순서, 레이어/feature 경계, JSX 하드코딩 문자열 금지(i18n).
- 다국어는 한국어/영어만 (`src/shared/i18n`). 인증 라우트는 `Stack.Protected` + `features/auth`.

## 상세 규칙

`.claude/rules/` 참고 (일부는 경로 조건부로 로드됨). SDK 58 요약은 `docs/README.md`에서 시작.

## 개인정보 / 보안

- 코드, 문서, 커밋, 로그, 예제 데이터에 개인정보(실명, 이메일, 전화번호, 계정 ID 등)와 비밀 값을 넣지 않는다.
- 예제 데이터는 명백한 더미 값만 사용한다.
