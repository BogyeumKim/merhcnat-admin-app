# 스타일 작성과 성능

질문: `<View style={{ ... }}>`처럼 스타일 객체를 직접 넣으면 성능 문제가 있는가, 실무 표준인가.

## 결론

**인라인 `style`은 그 자체로 성능 문제가 아니고, 표준적인 작성 방식이다.** `StyleSheet.create`로 바꾼다고 빨라지지 않는다.

| 근거 | 내용 |
| --- | --- |
| React Native 공식 문서 | `StyleSheet.create`는 "항등 함수"이고, 주된 이점은 **정적 타입 검사**다. 가독성/재사용을 위한 정리 수단이며 런타임 성능 이점은 문서에 없다 |
| Expo `expo-native-ui` skill | "Inline styles not StyleSheet.create unless reusing styles is faster" (재사용이 아니면 인라인) |
| React Compiler (이 프로젝트에서 켜짐) | 컴파일된 코드를 직접 확인했다. 인라인 스타일 객체는 의존하는 값(insets, 색 등)이 바뀔 때만 다시 만들어지고 나머지는 캐시된다 (`$[n]` 캐시 슬롯). 정적 객체는 한 번만 만들어진다 |
| 실측 | `npm run check:compiler`: 비레거시 함수 **47개 모두 컴파일, bail-out 0** |

과거에 "스타일을 ID로 등록해 성능이 좋다"는 이야기가 있었다는 점은 일반 지식이며 이번에 이력을 확인하지는 않았다. 현재 공식 문서 기준으로는 해당하지 않는다.

## 이 프로젝트의 작성 규칙

- **값이 동적이면 인라인** (안전 영역 inset, 색 스킴, props): `paddingTop: insets.top` 같은 것.
- **여러 요소가 공유하거나 길고 완전히 정적인 블록**은 `StyleSheet.create`(또는 모듈 상수). 이유는 성능이 아니라 가독성/타입 검사.
- 성능 목적으로 스타일을 `StyleSheet.create`로 바꾸지 않는다.
- `@expo/ui`에 넘기는 모디파이어 배열/Shape 같은 **네이티브 prop 객체**는 정적이면 모듈 상수로 둔다 (`.claude/rules/expo-ui.md`).

## 진짜 성능 위험은 따로 있다

스타일 객체가 아니라 아래를 본다.

- 긴 목록: `FlatList`/`FlashList`의 항목 렌더러(`renderItem`)와 `keyExtractor`, 항목 안의 무거운 계산. (`@expo/ui` `List`는 가상화되지 않음)
- 렌더 중에 만드는 무거운 객체(예: 렌더 본문의 `new Keyframe(...)`)는 모듈 스코프로 올린다.
- 제스처/스크롤 핸들러에서의 `setState`, 프레임마다 JS 스레드 작업 (`expo-animation` skill).
- React Compiler가 포기(bail-out)한 컴포넌트: 자동 메모이제이션이 사라진다. `npm run check:compiler`로 점검한다 (props 변경, 렌더 중 ref 읽기 같은 규칙 위반이 원인).
- 입력마다 불필요한 큰 트리 재렌더: 상태를 화면 최상단에 두지 않는다 (RHF `Controller`는 해당 필드만 다시 렌더한다).

## 점검

```bash
npm run check:compiler   # React Compiler가 최적화하지 못하는 함수가 있으면 실패
```

새 컴포넌트/훅을 추가한 뒤 실행한다. (`@babel/core`, `babel-plugin-react-compiler`는 `babel-preset-expo`가 가져오는 전이 의존성을 쓴다.)
