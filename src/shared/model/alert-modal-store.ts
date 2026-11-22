import { create } from 'zustand';
import { combine } from 'zustand/middleware';

/** 확인/취소 알림(로그아웃 확인 등). 문구는 호출하는 쪽이 번역해서 넘긴다. */
export type AlertModalRequest = {
  title: string;
  description?: string;
  confirmLabel: string;
  /** 없으면 기본 문구(`common.cancel`). */
  cancelLabel?: string;
  /** 되돌릴 수 없는 동작(로그아웃, 삭제): iOS `destructive` 스타일, Android 오류색 버튼. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

export type AlertModalState = { isOpen: false } | ({ isOpen: true } & AlertModalRequest);

const CLOSED: AlertModalState = { isOpen: false };
const initialState: { alert: AlertModalState } = { alert: CLOSED };

/**
 * 앱 전역 알림 다이얼로그. 화면은 열기만 하고, 그리기는 `core/providers/alert-modal-host`가 한 곳에서 한다.
 * 상태를 `alert` 키 아래 통째로 교체한다: `combine`의 `set`은 얕은 병합이라 최상위 유니온은 닫을 때 이전 필드가 남는다.
 */
const useAlertModalStore = create(
  combine(initialState, (set) => ({
    actions: {
      open: (request: AlertModalRequest) => set({ alert: { isOpen: true, ...request } }),
      close: () => set({ alert: CLOSED }),
    },
  })),
);

/** 호스트용: 현재 알림 상태. */
export const useAlertModal = () => useAlertModalStore((store) => store.alert);
/** 화면용: 알림을 연다(액션만 구독해 리렌더 없음). */
export const useOpenAlertModal = () => useAlertModalStore((store) => store.actions.open);
export const useCloseAlertModal = () => useAlertModalStore((store) => store.actions.close);
