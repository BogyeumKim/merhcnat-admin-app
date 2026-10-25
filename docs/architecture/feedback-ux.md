# 폼 · 오류 표시 · 토스트

로그인 화면에서 구현했고 이후 모든 폼의 기준이다. 근거는 웹 조사(블로그/튜토리얼 수준, 여러 곳이 같은 내용), 설치된 패키지 소스, Expo 문서다. **기기에서 실행해 확인한 것은 없다.**

## 1. 폼: react-hook-form을 쓴다

- Expo에서도 react-hook-form(RHF) + zod 조합이 2026년 튜토리얼에서 여전히 표준으로 소개된다 (네이티브 입력은 `Controller`로 연결). TanStack Form 같은 대안과의 비교는 조사에서 찾지 못했다.
- 설치: `react-hook-form`, `@hookform/resolvers`. **resolvers는 5.x로 고정**했다 (6.x는 선택적 peer(`@typeschema/*`, `effect@4`)가 설치 트리의 `effect@3`과 충돌해 `npm install`이 실패). 5.x는 zod 4를 지원하고, 런타임에서 검증 메시지/trim 동작을 확인했다.
- **네이티브 입력과의 연결 방식**
  - `@expo/ui` `TextInput`은 `value`에 문자열이 아니라 네이티브 상태를 받는다. RHF 값은 `onChangeText={field.onChange}`로만 받고, 필드는 자기 텍스트를 직접 유지한다 (`value` 미전달).
  - 지울 때는 `resetField()` + `TextInputRef.clear()`.
  - 검증 실패 시 RHF가 첫 오류 필드에 포커스를 주도록 `field.ref`를 `TextInputRef`에 연결한다 (`focus()` 필요. 리뷰 에이전트가 소스로 확인 중).
  - 비용: `Controller`가 입력마다 해당 필드 컴포넌트를 다시 렌더한다. 필드 2개짜리 폼에서는 무시할 수준이고 네이티브 속성은 바뀌지 않는다.
- 검증 메시지는 문장이 아니라 **코드**다 (`USER_ID_REQUIRED` 등). zod 스키마가 코드를 내고 UI가 `validation.<code>`로 번역한다 (ko/en). 허용 코드는 `shared/forms/validation.ts`.
- 전송 중 이중 제출은 `inFlight` 가드와 `pending`으로 막는다 (RHF는 `handleSubmit` 중복 호출을 막지 않는다).

## 2. 오류는 종류에 따라 다르게 보여준다

조사 결과(secondary 자료, 여러 글이 일치): 로그인 실패를 토스트로만 띄우면 사용자가 놓쳐 이유를 모른다. 필드 문제는 필드 옆, 확인이 필요한 오류는 지속되는 인라인/알림, 토스트는 자동으로 사라지는 저강도 알림(성공 확인, 일시적 시스템 상태)에 맞다. 라이브 영역/낭독이 필요하고, 자동으로 사라지는 메시지는 WCAG 2.2.1(시간 조절)을 고려해야 한다 (후자는 2차 해석, WCAG 원문 미확인).

| 상황 | 표시 | 이유 |
| --- | --- | --- |
| 입력 검증(빈 값, 6자리 아님) | **필드 아래 인라인** + 필드 테두리 강조 | 어느 필드인지 바로 보임 |
| 아이디/비밀번호 불일치, 계정 유형 불가 | **폼 상단 `FormAlert`(지속)** | 읽고 행동해야 함. 계정 존재 여부를 드러내지 않는 한 문장 |
| 인증 코드 오류/만료/잠금 | **코드 필드 아래 인라인** (입력을 고치면 사라짐) | 필드 문제 |
| 요청이 너무 많음(429) | **인라인(지속)** | 사용자가 기다렸다가 다시 시도해야 하므로 6초 토스트로는 부족 |
| 네트워크 끊김, 타임아웃, 알 수 없는 오류 | **토스트(오류)** | 입력과 무관하고 바로 다시 시도할 수 있는 일시적 상태 |
| 코드 전송 성공 | **토스트(성공)** | 저강도 확인 |
| 점검 | 점검 화면 | 기간 안내가 필요한 상태 |

- 분류는 `shared/api/error-presentation.ts`의 `Record<ErrorCode, 'inline' | 'toast' | 'maintenance'>`가 한 곳에서 정한다. 새 오류 코드를 추가하면 분류하기 전까지 **컴파일 오류**다.
- 인라인 오류는 `useAnnounce`로 VoiceOver/TalkBack에 낭독하고, 토스트도 `AccessibilityInfo.announceForAccessibility`를 같이 호출한다 (라이브러리 자체 낭독 여부는 미확인).
- **브랜드 빨강과 오류 빨강이 가깝다.** 오류는 색만으로 표시하지 않는다: 테두리 + 옅은 배경의 `FormAlert`, 두꺼운 필드 테두리, 메시지 문장. 오류색은 브랜드 액션색과 다른 명도(라이트 `#B42318`, 다크 `#FF8A80`)를 쓴다.

## 3. 토스트: sonner-native

**선택 근거**
- `@expo/ui`에는 토스트가 없다: Jetpack Compose에 `Snackbar`(Android 전용)만 있고 iOS/universal 토스트는 없다 (`list-components` 확인).
- 비교(2026 가이드와 라이브러리 소스):

| 라이브러리 | 특징 |
| --- | --- |
| `sonner-native` | JS 뷰. 겹쳐 쌓기(stack), 스와이프 닫기, `id`로 갱신, `visibleToasts`. Reanimated/gesture-handler 필요 |
| `react-native-toast-message` | JS 뷰, 완전 커스텀(스타일을 직접), 순수 JS라 Expo Go에서도 동작. 한 가이드는 "특별한 의견이 없으면 기본 선택"이라 소개 |
| `burnt` | 네이티브 토스트(iOS SPIndicator/AlertKit, Android ToastAndroid). 스타일 거의 불가, 겹침/갱신 없음, 개발 빌드 필요 |

- 이 프로젝트는 이미 Reanimated 4.7, gesture-handler 3.3, screens 4.30, safe-area, worklets 0.13을 갖췄고 sonner-native 0.27.0의 peer 요건(Reanimated ≥ 4.1, gesture-handler ≥ 2.28, screens ≥ 4.16, worklets ≥ 0.6.1, svg ≥ 15.12)을 만족한다. 추가 설치는 `react-native-svg`뿐이다. 최근 Expo SDK 57 + Reanimated 4 스택에서 선택한 사례가 있다(GitHub 이슈, 2차 출처).
- gesture-handler 3.x에서도 sonner-native가 쓰는 `Gesture.Pan()/Tap()/Race()`는 `Gesture`로 export된다 (레거시 빌더 API, 설치본 확인). 실제 동작은 기기 확인 필요.
- 라이브러리 README는 "Reanimated 3"이라고 적지만 peer 의존성은 `^4.1.1`이다 (README가 오래됨).
- 교체 가능성: 앱 코드는 `sonner-native`를 직접 import하지 않고 `shared/ui/toast.ts`(`showErrorToast`/`showSuccessToast`)만 쓴다.

**쌓이는 방식 (사용자 요구: 여러 번 눌러도 예쁘게)**
- 같은 `id`로 다시 호출하면 새 토스트를 쌓지 않고 **기존 토스트를 갱신하고 흔들어서**(`autoWiggleOnUpdate="always"`) "다시 실패했다"를 알린다. 오류 토스트의 `id`는 `error:<code>`라서, 같은 실패를 열 번 눌러도 토스트 하나가 갱신된다.
- 서로 다른 오류는 다른 `id`라서 쌓인다. 동시에 최대 3개(`visibleToasts`).
- 위치는 위쪽 중앙: 키보드와 탭바를 피한다. 닫기 버튼 포함, 오류는 6초.
- 마운트: 루트 `GestureHandlerRootView` 안, 네비게이터 뒤 (`app/_layout.tsx`의 `ToastHost`).

## 4. 미확인 (기기/후속 확인)

- 비밀번호 초기화 시 네이티브 `clear()`가 `onChangeText('')`를 발생시키면 RHF 재검증 오류가 잠깐 보일 수 있다 (`clear()` 후 `resetField`로 완화, 기기 확인 필요).
- 인증 코드가 서버에서 거부된 뒤 6자리를 지울지(친절하지만 `clear()`가 오류 문구도 지울 수 있음): 제품 결정 + 기기 확인.
- 토스트 낭독이 라이브러리의 `aria-live`와 `announceForAccessibility`로 두 번 나올 수 있음 (Android).
- 시스템 글꼴 최대에서 토스트 줄바꿈/크기 (`allowFontScaling` 옵션이 있음), 토스트의 VoiceOver/TalkBack 낭독.
- iOS에서 토스트가 네이티브 스택/시트 위에 올라오는지(`fullWindowOverlay`), 키보드 위에 가려지지 않는지.
- RHF가 검증 실패 시 `TextInputRef`에 호출하는 메서드와 포커스 동작.

## 5. 참고

- https://react-hook-form.com/get-started (네이티브 입력은 `Controller`)
- https://github.com/gunnartorfis/sonner-native 와 `node_modules/sonner-native/src/*`
- 오류 UX 글들은 secondary 자료다: 인라인/지속 오류 vs 토스트, 라이브 영역 낭독.
