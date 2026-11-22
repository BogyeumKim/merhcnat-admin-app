import type { TextInputRef } from '@expo/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { loginSchema, type LoginValues } from '../model/forms';

type Options = {
  pending: boolean;
  /** 값을 올리면 비밀번호 입력란을 비운다(로그인 거부 후). 마운트 시점 값은 무시한다. 포커스는 옮기지 않는다. */
  passwordResetKey: number;
  onSubmit: (input: LoginValues) => void;
  /** 사용자가 입력을 고치기 시작함: 이전 시도에 대한 폼 오류를 지운다. */
  onEdit: () => void;
};

/**
 * 로그인 폼의 상태와 동작. react-hook-form이 값과 유효성의 단일 소유자이고,
 * 네이티브 입력란은 자체 텍스트를 유지하므로(`value` prop 없음) 지우기는 입력란 ref로 한다.
 * React 상태는 입력란에 텍스트가 있는지만 안다(지우기 버튼용).
 */
export function useLoginForm({ pending, passwordResetKey, onSubmit, onEdit }: Options) {
  const userIdRef = useRef<TextInputRef | null>(null);
  const passwordRef = useRef<TextInputRef | null>(null);
  const [hasUserId, setHasUserId] = useState(false);
  // 현재 비밀번호 텍스트가 입력된 시점의 reset 키: 리셋 이전에 입력한 텍스트는 더 이상 유효하지 않다(파생값이라 지우는 effect가 필요 없음).
  const [typedUnderKey, setTypedUnderKey] = useState<number | null>(null);
  const hasPassword = typedUnderKey === passwordResetKey;

  const {
    control,
    handleSubmit,
    resetField,
    formState: { isValid },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    // 필드 오류는 제출(버튼·키보드 완료 → `handleSubmit`)했을 때만 띄우고, 그 뒤로는 입력마다 다시 검증해 고치면 바로 사라진다.
    // 입력란을 떠나기만 해서는 오류를 띄우지 않는다. `isValid`(버튼 활성)는 구독 중이면 모드와 무관하게 입력마다 계산된다(RHF 7.91 `_setValid`).
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { userId: '', password: '' },
  });

  // 마운트 때의 키는 처리된 것으로 본다: 폼이 다시 마운트될 때(`key`) 새 입력란에 네이티브 `clear()`를 부르지 않는다.
  // (Android `clear()`는 Compose 내용이 구성된 뒤에만 등록되어, 그 전에 부르면 거부된다.)
  const handledResetKey = useRef(passwordResetKey);
  useEffect(() => {
    if (passwordResetKey === handledResetKey.current) return;
    handledResetKey.current = passwordResetKey;
    // 거부 오류는 로그인 화면이 보일 때 나므로 입력란이 구성돼 있다. 네이티브 텍스트를 먼저 지운다: 빈 값을 보고하면 아래 리셋이 그로 인한 오류도 함께 지운다.
    passwordRef.current?.clear();
    resetField('password');
  }, [passwordResetKey, resetField]);

  const submit = handleSubmit((values) => {
    if (!pending) onSubmit(values);
  });

  const clearUserId = () => {
    userIdRef.current?.clear();
    resetField('userId');
    setHasUserId(false);
  };

  const clearPassword = () => {
    passwordRef.current?.clear();
    resetField('password');
    setTypedUnderKey(null);
    passwordRef.current?.focus();
  };

  const canSubmit = isValid && !pending;

  return {
    control,
    userIdRef,
    passwordRef,
    hasUserId,
    hasPassword,
    canSubmit,
    submit,
    clearUserId,
    clearPassword,
    changeUserId: (text: string) => {
      setHasUserId(text.length > 0);
      if (text.length > 0) onEdit();
    },
    // 빈 값은 리셋(`clear()`)도 보고하므로 오류를 지우는 신호로 쓰지 않는다: 방금 띄운 거부 오류가 바로 사라지면 안 된다.
    changePassword: (text: string) => {
      setTypedUnderKey(text.length > 0 ? passwordResetKey : null);
      if (text.length > 0) onEdit();
    },
  };
}
