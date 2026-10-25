# 구조: 탭/도메인별 모듈 (feature-first)

`users/`, `settings/`처럼 탭/도메인마다 폴더를 두고, 그 안에 api·queries·mutations·화면을 함께 둔다.
(FSD를 검토했으나 탭/도메인별 모듈로 결정했다.)

## 레이아웃

```
src/
  app/                  # Expo Router 라우트 (얇게)
    _layout.tsx, sign-in.tsx, (tabs)/…
  core/                 # 앱 조립
    navigation/app-tabs/   # iOS NativeTabs / Android Compose 플로팅 바
    providers/             # (필요 시) QueryClient, 모달 호스트
  features/
    auth/               # 현재 존재: 세션, 토큰 저장, 로그인 화면
      api/ model/ screens/ index.ts
    <users, settings, …>/
      api/ queries/ mutations/ components/ screens/ model/ index.ts
  shared/               # api client·types, i18n, lib/storage, ui …
```

## 규칙 (ESLint `import/no-restricted-paths`가 강제)

1. `app → core → features → shared` 방향으로만 import.
2. 다른 feature는 `@/features/<name>`(index.ts)로만 import. 내부 파일 deep import 금지.
3. 둘 이상의 feature가 쓰는 코드는 `shared/`로 올린다.
4. route 파일은 `export { XxxScreen as default } from '@/features/xxx'` 수준.

## 근거 (검색 결과, 블로그/강의 수준 — 공식 표준 아님)

- 레이어별(components/screens/hooks) 구조는 작은 앱에 단순하지만, 규모가 커지면 기능 간 경계가 흐려지고 순환 의존이 생긴다는 설명이 반복된다.
- feature-first는 각 기능이 로직·컴포넌트·훅·API를 소유하고, 공용 API client/디자인 시스템/유틸을 `shared`(또는 `core`)에 두는 형태가 흔한 절충안으로 소개된다.
- 어떤 구조든 네이밍 일관성과 UI/비즈니스 로직/API 호출의 분리가 더 중요하다는 점이 공통으로 강조된다.

## 시작 템플릿 잔재

`src/components`, `src/hooks`, `src/constants`와 데모 화면(`(tabs)/index.tsx`, `explore.tsx`)은 레거시다. 실제 화면을 만들면서 `features/`와 `shared/`로 옮기고 `eslint.config.js`의 `LEGACY` 목록에서 지운다.
