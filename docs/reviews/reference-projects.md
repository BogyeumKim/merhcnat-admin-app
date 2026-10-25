# 참고 프로젝트 검토 기록

## onebite-log (React 웹) — 채택

TanStack Query 구조(UI/서비스 분리, `UseMutationCallback`, 정규화 캐시, 중앙 쿼리 키). 상세: `docs/architecture/data-fetching.md`.
Supabase 관련 코드는 사용하지 않는다.

## RNCopilot (Expo SDK 55 템플릿) — 항목별 검토 중

Supabase는 제외. 아래 항목은 하나씩 사용자가 채택 여부를 결정한다. 결정 전에는 코드/설정에 반영하지 않는다.

| 항목 | 결정 |
| --- | --- |
| Claude hooks (억제 주석 차단, 훅 우회 플래그 차단, 편집 후 lint) | **채택** → `.claude/hooks/` (3개). 원본의 Write 입력 키(`file_text`)는 오류라 `content`로 수정, 편집 후 lint는 남은 오류를 Claude에게 전달하도록 변경 |
| Git hooks (husky + lint-staged + commitlint) | **제외** |
| 컴포넌트 폴더 패턴 | **변형 채택**: 단일 파일 기본, 커지면 폴더 (`typescript.md`) |
| Scaffold 스크립트/스킬 | **보류 해제 가능**: 구조는 탭/도메인별 모듈로 결정됨. `create-feature` 스킬을 새 구조로 작성 예정 |
| ErrorBoundary | **Router 방식으로 진행 예정** (`unstable_screenErrorBoundary`). 아직 미구현 |
| 타입 있는 MMKV + Query persister | **변형 채택**: `expo-sqlite/kv-store` 타입 키 저장소. persister는 보안상 미적용 (`docs/architecture/storage-env-testing.md`) |
| 환경 변수 검증 | **규칙만 추가**, 첫 변수 추가 시 구현 |
| i18n (한국어/영어) | **채택** → `src/shared/i18n` |
| Unistyles 테마 | **제외** (`@expo/ui` 사용) |
| 라우트 보호 훅 | **채택(방식 변경)**: 훅 리다이렉트 대신 `Stack.Protected` + `features/auth` |
| ESLint 엄격 규칙 | **채택** → `eslint.config.js` (any/non-null/import 순서/FSD 방향/i18n 문자열) |
| Jest + jest-expo | **보류**: 테스트할 로직이 생길 때 도입 |

참고: RNCopilot 자체 코드에도 `eslint-disable`와 non-null 단언이 있어, 문서의 "절대 금지" 규칙이 코드와 완전히 일치하지는 않는다.
