import { create } from 'zustand';
import { combine, createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import { STORAGE_KEYS, storage } from '@/shared/lib/storage';

const KEY = STORAGE_KEYS.hideAmounts;

/**
 * `shared/lib/storage`(동기 KV) 위의 persist 저장소. 키는 이 store 하나뿐이라 `name` 대신 고정 키를 쓴다.
 * 이전 버전은 같은 키에 '1'/'0' 문자열을 저장했다: 읽을 때 persist 형태로 바꿔 설정을 잃지 않는다(다음 저장 때 JSON으로 덮어씀).
 */
const hideAmountsStorage: StateStorage = {
  getItem: () => {
    const raw = storage.getString(KEY);
    if (raw === '1' || raw === '0') return JSON.stringify({ state: { hidden: raw === '1' }, version: 0 });
    return raw;
  },
  setItem: (_name, value) => storage.setString(KEY, value),
  removeItem: () => storage.remove(KEY),
};

const useStore = create(
  persist(
    combine({ hidden: false }, (set) => ({
      actions: {
        setHidden: (hidden: boolean) => set({ hidden }),
      },
    })),
    {
      name: KEY,
      storage: createJSONStorage(() => hideAmountsStorage),
      // 액션은 저장하지 않는다: 숨김 여부만 기기에 남긴다.
      partialize: (state) => ({ hidden: state.hidden }),
    },
  ),
);

/** 홈 금액을 가릴지 여부 ("금액 숨기기": 매장 카운터 위의 폰은 손님에게 보인다). 기기에 저장해 기억한다. */
export const useAmountsHidden = () => useStore((state) => state.hidden);
export const useSetAmountsHidden = () => useStore((state) => state.actions.setHidden);
