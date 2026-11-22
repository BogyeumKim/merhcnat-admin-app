import { Keyboard } from 'react-native';

/** 블러 완료(`onBlur`)를 기다리는 최대 시간. 이벤트가 오지 않아도 시트는 연다. */
const BLUR_TIMEOUT_MS = 300;

/** 입력란마다 하나인 고정 핸들(`NativeFieldBase`가 만든다). ref 인스턴스는 렌더마다 바뀔 수 있어 쓰지 않는다. */
export type FocusableField = { blur: () => void };

/**
 * 지금 포커스된 `@expo/ui` 입력란(앱 전체에 하나). `NativeFieldBase`가 포커스/블러 때 기록한다.
 * 시트를 띄우기 전에 `blurFocusedField()`로 포커스를 풀어, 시트가 닫힐 때 OS가 키보드를 되살리지 않게 한다(`open-sheet.ts`).
 */
let focused: FocusableField | null = null;
/** 블러를 요청하고 `onBlur`를 기다리는 입력란. */
let waiting: { field: FocusableField; done: () => void } | null = null;

export function markFieldFocused(field: FocusableField | null) {
  focused = field;
}

/** 블러·언마운트된 입력란이 기록된 그 입력란일 때만 지운다(다음 입력란의 포커스가 먼저 올 수 있다). 블러 대기도 끝낸다. */
export function forgetField(field: FocusableField | null) {
  if (field === null) return;
  if (focused === field) focused = null;
  if (waiting?.field === field) waiting.done();
}

/**
 * 포커스된 입력란의 포커스를 풀고(값은 유지) 실제로 풀릴 때까지 기다린다.
 * `ref.blur()`는 네이티브 비동기 호출인데 universal 래퍼가 Promise를 버리므로, 입력란의 `onBlur`(→ `forgetField`)로 완료를 안다.
 * Android는 Compose 포커스 해제만으로는 액티비티가 포커스 뷰를 기억해 시트가 닫힐 때 키보드를 되살리므로 `Keyboard.dismiss()`도 부른다.
 */
export function blurFocusedField(): Promise<void> {
  const field = focused;
  if (field === null) return Promise.resolve();
  focused = null;
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      waiting = null;
      resolve();
    };
    const timer = setTimeout(done, BLUR_TIMEOUT_MS);
    waiting = { field, done };
    field.blur();
    if (process.env.EXPO_OS === 'android') Keyboard.dismiss();
  });
}

/**
 * 화면 빈 곳을 탭하면 키보드를 내린다(스펙 공통). 포커스된 입력란이 있을 때만 블러한다(값은 유지).
 * 폼 셸(`NativeFormScroll`)의 배경 탭 레이어가 부른다. 레지스트리 밖 입력(RN TextInput)도 있을 수 있어 `Keyboard.dismiss()`도 부른다.
 */
export function dismissKeyboard() {
  if (focused !== null) void blurFocusedField();
  if (Keyboard.isVisible()) Keyboard.dismiss();
}
