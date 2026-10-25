---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# 폼 · 오류 표시 · 토스트 규칙

근거와 조사: `docs/architecture/feedback-ux.md`

- **폼은 react-hook-form + zod(`zodResolver`)** 를 쓴다. 입력은 `@expo/ui` 필드를 `Controller`로 연결하고 `onChangeText={field.onChange}`만 쓴다. `@expo/ui` `TextInput`에 `value`로 문자열을 넘기지 않는다. 지울 때는 `resetField()` + `TextInputRef.clear()`.
- zod 메시지는 문장이 아니라 **검증 코드**(`shared/forms/validation.ts`의 `ValidationCode`)다. 화면에서 `useValidationMessage()`로 번역한다. 새 코드는 `VALIDATION_CODES`와 `validation.<code>`(ko/en)에 함께 추가한다.
- 서버 실패를 어떻게 보여줄지는 `presentationOf(error.code)`(`shared/api/error-presentation.ts`)를 따른다: `inline`(지속, 필드/폼 알림), `toast`(일시적 시스템 오류), `maintenance`(점검 화면). 화면마다 임의로 정하지 않는다.
  - 로그인 자격 증명 실패처럼 사용자가 읽고 행동해야 하는 오류를 **토스트로만** 보여주지 않는다. 계정 존재 여부를 드러내지 않는 한 문장으로 `FormAlert`에 둔다.
  - 필드 검증/코드 오류는 필드 아래(`LabeledField error`).
- 새 오류 코드를 만들면 `ERROR_CODES`, `error-presentation.ts`(컴파일 강제), `errors.<code>`(ko/en)를 같이 고친다.
- **토스트는 `shared/ui/toast.ts`(`showErrorToast`/`showSuccessToast`)로만** 띄운다. `sonner-native`를 직접 import하지 않는다. `id`는 필수다: 같은 id는 기존 토스트를 갱신하므로(중복 쌓임 방지) 오류는 `error:<code>`, 성공 확인은 고정 id. 성공 토스트는 저강도 확인에만 쓴다.
- 토스트/인라인 오류 모두 낭독한다 (`useAnnounce`, 토스트 함수가 호출). 오류는 색만으로 구분하지 않는다 (`FormAlert`의 테두리·배경, 필드 테두리, 문장).
- 브랜드 빨강(`brand` `#ff003a`)은 로고/그래픽 전용이다. 버튼, 링크, 틴트는 `action`(대비 4.5:1 이상)을 쓴다.
