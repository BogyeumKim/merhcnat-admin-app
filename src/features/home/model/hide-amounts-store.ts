import { create } from 'zustand';

import { STORAGE_KEYS, storage } from '@/shared/lib/storage';

type State = { hidden: boolean; setHidden: (hidden: boolean) => void };

const useStore = create<State>((set) => ({
  hidden: storage.getString(STORAGE_KEYS.hideAmounts) === '1',
  setHidden: (hidden) => {
    storage.setString(STORAGE_KEYS.hideAmounts, hidden ? '1' : '0');
    set({ hidden });
  },
}));

/** 홈 금액을 가릴지 여부 ("금액 숨기기": 매장 카운터 위의 폰은 손님에게 보인다). 기기에 저장해 기억한다. */
export const useAmountsHidden = () => useStore((state) => state.hidden);
export const useSetAmountsHidden = () => useStore((state) => state.setHidden);
