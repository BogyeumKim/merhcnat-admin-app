---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript 규칙

- `strict: true`. `any` 대신 구체 타입 또는 `unknown` + 좁히기.
- import 별칭은 `@/*` (`src/*`). 상대 경로 `../../..` 체인을 만들지 않는다.
- RN 0.87+ Strict TypeScript API: ref 타입은 `ViewInstance`, `TextInputInstance` 등 새 타입을 쓴다. `NativeMethods`는 제거됨.
- React Compiler가 켜져 있다 (`experiments.reactCompiler`). 불필요한 `useMemo`/`useCallback`/`React.memo`를 새로 추가하지 않고, 렌더 중 부수효과·ref 변경 같은 규칙 위반을 만들지 않는다. (단, worklet 콜백 등 안정 참조가 필요한 곳은 예외)
- 기존 파일의 네이밍·주석 밀도·스타일을 따른다. 파일명은 kebab-case, 컴포넌트는 PascalCase.

## 린트 (엄격 규칙, `eslint.config.js`)

- `any`, non-null 단언(`!`), `@ts-ignore`/`@ts-nocheck`, 설명 없는 `@ts-expect-error` 금지. 인라인 `eslint-disable` 주석은 **무효**이며 hook이 쓰기를 막는다. 코드를 고친다.
- `import type`(인라인 `type`) 사용, import는 `builtin → external → @/ alias → 상대경로` 순서에 그룹 사이 빈 줄, 알파벳순.
- 레이어 방향(`app → core → features → shared`)과 feature 간 deep import는 `import/no-restricted-paths`가 막는다.
- 시작 템플릿 레거시 파일은 `eslint.config.js`의 `LEGACY` 목록에서 엄격 규칙이 제외돼 있다. 마이그레이션하면 목록에서 지운다.

## 컴포넌트 파일 구성

- 기본은 `components/` 안의 **단일 파일**(`kebab-case.tsx`) 하나. 스타일/타입/하위 컴포넌트가 늘어 한 파일이 200줄 안팎을 넘으면 `components/<component>/` 폴더로 나누고 `index.ts`로 노출한다.
- `Component.tsx` + `Component.styles.ts` + `Component.types.ts` + `index.ts`를 컴포넌트마다 기계적으로 만들지 않는다 (UI를 `@expo/ui`로 그리므로 스타일 파일이 필요한 경우가 드물다).
- feature 밖으로 노출하는 것은 feature 루트 `index.ts`뿐이다.
