# Expo skill 기준 코드 검사 기록

대상: `src/core`, `src/features`, `src/shared`, `src/app/_layout.tsx`, `src/app/sign-in.tsx`, `src/app/(tabs)/_layout.tsx`. 시작 템플릿 레거시(`src/components`, `src/hooks`, `src/constants`, 데모 화면)는 제외.
사용한 skill: `expo-ui`, `expo-router`, `expo-native-ui`. 사실 확인은 설치된 SDK 58 패키지의 타입/소스로 했다.

## 지침과 일치

- `@expo/ui` 트리는 모두 `Host`로 감싸고 `Host`는 루트(`@expo/ui`)에서 import.
- Android 전용 `@expo/ui/jetpack-compose`는 `app-tabs.android.tsx`에서만 import. 플랫폼 파일은 `app/` 밖에 있다.
- 화면은 universal 먼저(로그인 화면), universal에 없는 탭바만 Compose 사용.
- route 파일은 얇고 컴포넌트/유틸을 `app/`에 두지 않음. `/` 라우트는 `(tabs)/index`.
- kebab-case 파일명, `@/` 경로 별칭, `React.use` 사용, `react-native-safe-area-context`의 `SafeAreaView`.

## 이번에 고친 것

| 지침 | 이전 | 수정 |
| --- | --- | --- |
| `process.env.EXPO_OS` (not `Platform.OS`) | `use-tab-bar-inset.ts`가 `Platform.OS` | `process.env.EXPO_OS` |
| `Stack`은 `expo-router/stack` | `expo-router` 루트에서 import | `expo-router/stack` |
| `@react-navigation/*` 대신 `expo-router/react-navigation` | `ThemeProvider` 등을 `expo-router` 루트에서 import | `expo-router/react-navigation` |

## skill과 이 프로젝트가 다른 부분 (프로젝트 결정 우선)

- `expo-native-ui`는 "항상 Expo Go를 먼저 시도"하라고 하지만, 이 프로젝트는 **로컬 prebuild**로 간다 (스토어용 SDK 58 Expo Go 미출시 + Compose 탭바 등).
- `expo-router` skill 예시는 `expo-router/unstable-native-tabs`를 쓰지만, SDK 58 문서와 설치본은 `expo-router/native-tabs`가 정식 경로다. 이 프로젝트는 후자를 쓴다 (skill이 SDK 58 이전 기준).
- skill은 "화면 제목은 네비게이션 스택 타이틀로" 하라고 하지만 로그인 화면은 헤더 없는 전체 화면이라 `Text`로 제목을 둔다.

## 남은 사소한 사항 (결정 필요 없음 / 사용자 취향)

- skill은 인라인 스타일을 선호(`StyleSheet.create`는 재사용 시에만). 현재 로그인 화면과 탭바는 한 번만 쓰는 `StyleSheet.create`를 쓴다. 시작 템플릿과 같은 스타일이라 유지했다.
- 탭바 팔레트는 고정 hex다. skill은 `Color.android.dynamic.*` 같은 시맨틱 색을 권장하지만, 제공받은 디자인 사양(둥근 반투명 바)을 따라 고정했다. 시맨틱 색 전환은 디자인 결정.
- 로그인 화면 `Text`는 `@expo/ui` 컴포넌트라 `selectable` prop 적용 대상이 아니다.
- 로컬 실행/에뮬레이터 검증은 아직 하지 않았다.

## 로그인 구현 후 서브에이전트 리뷰 (SDK 58 일치 / 성능·반응형·접근성)

두 리뷰어가 읽기 전용으로 검토했다. 블로커는 없었고, 아래를 반영했다. **기기에서 실행한 확인은 없다.**

### 반영한 것

| 영역 | 지적 | 조치 |
| --- | --- | --- |
| 토큰 | `AUTHENTICATED`인데 `Access-Token` 헤더가 없으면 토큰 없이 로그인 상태가 됨 | `assertTokenIssued()`로 `INVALID_RESPONSE` 처리 |
| 토큰 | 스키마 검증이 실패한 응답의 토큰 헤더가 메모리에 남음 | 토큰 교체를 응답 수락 후로 이동 (`apiJson`) |
| 세션 | 로그아웃 후 늦게 온 응답이 토큰을 되살리거나, 이전 세션의 늦은 401이 새 세션을 로그아웃 | 세션 세대(generation) 카운터. 요청 시작 시점과 다르면 응답을 무시 |
| 오류 | `expo/fetch`는 abort를 이름 없는 `FetchError`로 던져 타임아웃이 `NETWORK_ERROR`로 보임 (설치 소스로 확인) | `timeout.aborted`/호출자 `signal`로 판별 |
| 재시도 | 503 `MAINTENANCE`, `INVALID_RESPONSE`가 자동 재시도됨 | 재시도 대상은 네트워크/타임아웃/그 외 5xx만 |
| 비밀번호 | `login.variables`에 비밀번호가 화면 수명 동안 남음 | `onSettled`에서 `reset()` |
| 중복 제출 | 연속 탭/Enter가 같은 요청을 두 번 보냄, 검증 중 취소 가능 | `inFlight` 가드, 진행 중 취소 버튼 비활성화 |
| 기기 ID | 한 번 실패한 Promise가 캐시되어 앱 재시작 전까지 로그인 불가 | 실패 시 캐시 해제 (읽기 실패는 새 ID 생성으로 이어지지 않음) |
| 플랫폼 | 기본 파일이 Compose 모디파이어를 import | `native-form-scroll.android.tsx`로 분리, 기본 파일은 중립 |
| 점검 | 인증 단계에서 `MAINTENANCE`가 오면 문구만 표시 | 점검 화면으로 이동, 기간 두 값을 각각 파싱 |
| 대비 | 브랜드 색이 흰 글자 3.53(라이트)/2.46(다크), 필드 테두리 1.47 | 라이트 `#1769C8`(5.40), 다크 `#3875D3`(4.51/4.65), 테두리 3:1 이상 (계산은 `colors.ts` 주석) |
| 접근성 | 입력창에 상시 라벨 없음, 오류 낭독 없음 | `LabeledField`(보이는 라벨), `useAnnounce`(오류 낭독) |
| 입력 | iOS 숫자 패드에 Return 키가 없어 제출 불가 | 6번째 숫자 입력 시 자동 제출 (버튼은 유지) |
| 터치 영역 | iOS 텍스트 버튼이 44pt 미만일 수 있음 | iOS 버튼 라벨 안쪽에 세로 패딩(`native-button.ios.tsx`) |
| 레이아웃 | Android 하단 패딩이 스크롤 밖에 있어 클리핑, 이중 계산 | 패딩을 스크롤 안쪽 `FormColumn`으로 이동 |
| 레이아웃 | 두 단 레이아웃의 브랜드 패널/오류 화면이 큰 글꼴에서 잘림 | 스크롤 가능, 아주 큰 글꼴에서는 태그라인 숨김, 로고 `maxWidth: 100%` |
| 리렌더 | 필드 비어 있음 상태를 매 입력마다 갱신, 팔레트 객체를 매번 생성 | "비어 있음" 상태 제거(제출 시 검증), 팔레트를 고정 객체로 |

### 반영하지 않은 것과 이유

- `Platform.select`가 iOS에서 `Color.android.*`를 평가해 위험하다는 지적: `expo-router`의 `Color.android.*`는 `process.env.EXPO_OS === 'android'`로 보호되는 Proxy라서 iOS에서 안전하다 (소스 확인). 유지.
- 로그아웃 UI, `TOKEN_EXPIRED` 로그아웃 안내, 서버에 로그아웃 알림: 범위 밖. 다음 작업.
- Android 제목 heading semantics, 드래그로 키보드 닫기(Android): 해당 API 확인 전이라 미구현.
- 레거시 `animated-icon` 의존: 시작 템플릿 정리 때 제거.

### 기기에서 확인해야 하는 것 (미확인)

SwiftUI `ScrollView`의 포커스 자동 스크롤, Android Compose의 `imePadding()` + 커서 보이기, edge-to-edge에서 키보드 인셋 전달, iOS CoreSVG의 `translate`/`stroke-linecap`, Hermes의 `Intl.DateTimeFormat(dateStyle/timeStyle)`, VoiceOver/TalkBack의 필드 낭독, Android `Color.android.dynamic.*`(API 31 미만 동작), 플레이스홀더/라벨 낭독.

## 폼 · 토스트 · 팔레트 · 로고 변경 리뷰

블로커 없음. RHF의 `field.ref` 프록시가 `focus()`만 요구하고 `TextInputRef`에 있음, `onChangeText`가 문자열을 넘김, `toast.error`의 같은 `id`가 기존 토스트를 갱신하고 흔듦(`shouldUpdate`), Toaster props 유효, `allowFontScaling` 기본 true, 팔레트 대비 수치(주석과 일치), SVG가 viewBox 안에 있고 호 명령 없음을 소스로 확인.
반영: 429를 인라인(지속)으로 분류, 비밀번호 초기화 순서(`clear()` 후 `resetField`), 쓰지 않는 `dismissAllToasts` 삭제, 대비 한계(액션색 텍스트를 필드 배경 위에 두지 않음)를 `colors.ts`에 기록.
미반영: 코드 거부 후 자동 지우기(제품 결정/기기 확인), 중복 낭독 가능성(기기 확인), `FormAlert` 아이콘(선택).

