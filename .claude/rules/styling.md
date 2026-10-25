---
paths:
  - "src/**/*.tsx"
---

# 스타일 작성 규칙

근거: `docs/architecture/styling-performance.md`

- 인라인 `style={{ ... }}`는 허용되는 표준 방식이다. 성능을 이유로 `StyleSheet.create`로 바꾸거나 반대로 인라인을 금지하지 않는다 (RN 문서: `StyleSheet.create`는 항등 함수. React Compiler가 인라인 객체를 캐시한다).
- 동적 값(inset, 색 스킴, props)은 인라인, 여러 곳이 공유하는 긴 정적 블록은 `StyleSheet.create`/모듈 상수 (가독성·타입 검사 목적).
- `@expo/ui`에 넘기는 모디파이어 배열·Shape 같은 네이티브 prop 객체는 정적이면 모듈 스코프 상수.
- 새 컴포넌트/훅을 추가하면 `npm run check:compiler`(React Compiler bail-out 0)와 `npm run lint`를 확인한다. 렌더 중 props 변경, 렌더 중 ref 읽기/쓰기는 컴파일러를 막는다.
- 렌더 본문에서 `new Keyframe(...)`, `Animated.Value` 같은 무거운 객체를 만들지 않는다. 성능 점검은 스타일이 아니라 목록 렌더러, 제스처/스크롤 핸들러, 불필요한 상태 위치를 먼저 본다.
