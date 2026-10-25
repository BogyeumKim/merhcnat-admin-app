---
paths:
  - "src/**"
---

# 구조 규칙: 탭/도메인별 모듈 (feature-first)

상세: `docs/architecture/feature-first.md`

```
src/
  app/            # Expo Router 라우트. 얇게: features의 screen을 re-export만
  core/           # 앱 전체 조립: providers, navigation(app-tabs), 전역 설정
  features/       # 탭/도메인 단위 모듈: users/, settings/, auth/ ...
    <feature>/
      api/         # 원시 요청 함수 (React 의존 없음)
      queries/     # useQuery 훅 + query-keys
      mutations/   # useMutation 훅
      components/  # 이 feature의 UI
      screens/     # 라우트 단위 화면 (route 파일이 re-export)
      model/       # zustand store, context, types, 권한/로직
      index.ts     # public API
  shared/         # 도메인과 무관한 공용: api client, ui, lib, i18n, config
```

- **의존 방향**: `app → core → features → shared`. 아래로만 import한다.
- **feature끼리**: 다른 feature는 그 feature의 `index.ts`로만 import한다 (ESLint가 강제). 둘 이상의 feature가 쓰는 것은 `shared/`로 올린다.
- 필요한 폴더만 만든다. 빈 폴더를 미리 만들지 않는다.
- `src/app/*.tsx`에는 로직을 두지 않는다. `export { XxxScreen as default } from '@/features/xxx'` 수준.
- 기존 시작 템플릿 폴더(`src/components`, `src/hooks`, `src/constants`)는 레거시. 건드릴 때 `shared/`로 옮기고 새 코드는 넣지 않는다.
- 플랫폼 분기 파일(`*.android.tsx`, `*.ios.tsx`)은 같은 이름의 기본 파일(`name.tsx`)을 반드시 함께 둔다 (TypeScript가 플랫폼 확장자를 해석하지 못하므로). 이 프로젝트는 **iOS/Android 전용**이며 web 대상이 아니다.
