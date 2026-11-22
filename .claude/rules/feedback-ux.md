---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# 폼 · 오류 표시 · 토스트 규칙

근거와 조사: `docs/architecture/feedback-ux.md`

- **폼은 react-hook-form + zod(`zodResolver`)** 를 쓴다. 입력은 `@expo/ui` 필드를 `Controller`로 연결하고 `onChangeText={field.onChange}`만 쓴다. `@expo/ui` `TextInput`에 `value`로 문자열을 넘기지 않는다. 지울 때는 `resetField()` + `TextInputRef.clear()`(화면이 보일 때만: Android `clear()`는 시트에 가려진 입력란에서 거부된다). 가려진 폼을 비워야 하면 `key`로 다시 마운트한다.
- 로그인 폼 값 유지 정책: 로그인 화면을 벗어나 진행한 인증 흐름(2단계 인증, 로그인 전 비밀번호 변경)이 성공 없이 끝나 돌아와도 아이디·비밀번호를 그대로 둔다(초기화 로직 없음). 도움말 시트도 값 유지, 비밀번호 오류(`INVALID_CREDENTIALS`)만 비밀번호를 지운다. 상세 `docs/architecture/login-ui.md`.
- **필드 검증 오류는 제출할 때만** 띄운다: 모든 RHF 폼은 `mode: 'onSubmit'`, `reValidateMode: 'onChange'`(제출 시도 뒤에는 입력마다 다시 검증해 고치면 바로 사라짐). 입력란을 떠나기만 해서(`onTouched`/`onBlur`) 또는 입력 중(`onChange`)에 오류를 띄우지 않는다. 버튼 활성은 `formState.isValid`(구독하면 모드와 무관하게 입력마다 계산, RHF 7.91 확인)로 계속 정하고, 키보드 완료/Go도 버튼과 같은 `handleSubmit` 경로로 제출한다. 비밀번호 규칙 목록·일치 표시처럼 오류가 아닌 힌트는 `useWatch`로 실시간 유지.
- zod 메시지는 문장이 아니라 **검증 코드**(`shared/forms/validation.ts`의 `ValidationCode`)다. 화면에서 `useValidationMessage()`로 번역한다. 새 코드는 `VALIDATION_CODES`와 `validation.<code>`(ko/en)에 함께 추가한다.
- 서버 실패를 어떻게 보여줄지는 `presentationOf(error.code)`(`shared/api/error-presentation.ts`)를 따른다: `inline`(지속, 필드/폼 알림), `toast`(일시적 시스템 오류), `maintenance`(점검 화면: 전체 화면, 스와이프·뒤로가기·버튼 모두 막아 아무것도 할 수 없다), `locked`(관리자 해제 전까지 잠긴 계정: 안내 화면, 재시도 버튼 없음), `suspended`(`ACCOUNT_SUSPENDED`: 정지된 사용자 안내 화면, 재시도 없음), `update`(`UPDATE_REQUIRED`: 필수 업데이트 전체 화면, 스토어만 열 수 있음), `insecure`(`DEVICE_INSECURE`: 보안 위험 기기 전체 화면). 서버가 세션을 끝낸 401은 로그인 화면이 "로그아웃했어요" 안내를 먼저 보여준다(`sessionEnded`). 화면마다 임의로 정하지 않는다.
  - 사용자 동작(mutation, 수동 새로고침) 실패는 `useErrorPresenter({ onInline })`(`shared/lib/use-error-presenter`)로 보여준다: 차단 종류는 전용 화면(라우트·파라미터는 `shared/api/blocking-error-route.ts` 한 곳), `toast`는 토스트, 나머지는 `onInline`. 인증 훅의 `useAuthErrorPresenter`는 이것의 별칭이다.
  - **로그인 후 쿼리의 차단 오류는 `QueryCache.onError`(`core/providers/query-provider.tsx`)가 한 곳에서 화면으로 보낸다**(`core/navigation/route-blocking-error.ts`: 이미 그 화면이면 또 쌓지 않고, 동시에 실패한 쿼리는 한 번만 이동). 로그인 후 mutation은 `MutationCache.onError`, 화면 표시기는 `navigateToBlockingScreen`(`shared/lib/blocking-navigation.ts`)으로 같은 함수를 거친다. 로그인 중 점검·필수 업데이트는 세션 종료 + 스택 초기화(`auth-jwt.md`). 화면 훅은 쿼리 결과에 차단 종류를 다시 처리하지 않는다. 전역에서는 `toast` 종류를 띄우지 않는다(예외: `SESSION_STORE_UNAVAILABLE`): 캐시가 있는 새로고침 실패만 화면 훅이 알린다(`use-home-screen`).
  - 시트 안에서 동작이 실패했을 때(예: 인증 수단 전송 실패)는 `FormAlert boxed`(옅은 오류색 카드, 채널 카드와 같은 패딩)를 쓴다.
  - 로그인 자격 증명 실패처럼 사용자가 읽고 행동해야 하는 오류를 **토스트로만** 보여주지 않는다. 계정 존재 여부를 드러내지 않는 한 문장으로 `FormAlert`에 둔다.
  - 필드 검증/코드 오류는 필드 아래(`LabeledField error`). **입력란에 빨간 테두리를 넣지 않는다**(`NativeField`는 `invalid`를 무시): 오류는 칸 아래 문구로만 알린다. 예외는 인증번호 6칸(`OtpBoxes`)의 옅은 오류 링.
  - **남은 시도 횟수·잠금 해제까지 남은 시간은 어디에도 표시하지 않는다**(서버가 `remainingAttempts` 등을 보내도 무시).
  - 네트워크 오류·타임아웃(로그인 포함)은 일반 오류 토스트(`showErrorToast`, `error:<code>`, 자동으로 사라짐)로만 알린다. [다시 시도] 같은 동작 스낵바나 자동으로 사라지지 않는 토스트는 두지 않고, 입력값을 유지해 사용자가 원래 버튼을 다시 누르게 한다.
  - 인증번호 오류: 6칸을 비우고 빨간 칸 + 문구를 보이되 포커스·커서를 코드로 옮기지 않으며, 다시 받기는 서버 `resendAfterSeconds` 타이머를 그대로 따른다. 코드를 너무 많이 틀린 400 `ACCOUNT_LOCKED`는 다른 잠김과 같이 `/account-locked` 화면으로 보낸다.
- 고객센터 연락 버튼은 `shared/ui/support-contact-buttons.tsx`(`SupportContactButtons`)를 쓰고, 개별 동작은 `shared/lib/support-contact.ts`의 `openSupportChat`(카카오톡)/`openSupportPhone`(전화)로만 연다. 화면마다 URL·번호를 직접 쓰지 않는다(값은 `shared/config/support.ts`).
- 새 오류 코드를 만들면 `ERROR_CODES`, `error-presentation.ts`(컴파일 강제), `errors.<code>`(ko/en)를 같이 고친다.
- **토스트는 `shared/ui/toast.ts`(`showErrorToast`/`showSuccessToast`)로만** 띄운다. `sonner-native`를 직접 import하지 않는다. `id`는 필수다: 같은 id는 기존 토스트를 갱신하므로(중복 쌓임 방지) 오류는 `error:<code>`, 성공 확인은 고정 id. 성공 토스트는 저강도 확인에만 쓴다.
- 토스트/인라인 오류 모두 낭독한다 (`useAnnounce`, 토스트 함수가 호출). 오류는 색만으로 구분하지 않는다 (`FormAlert`의 아이콘·문장).
- 브랜드 빨강(`brand` `#ff003a`)은 로고/그래픽 전용이다. 버튼, 링크, 틴트는 `action`(대비 4.5:1 이상)을 쓴다.
