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

/** Whether the home amounts are masked ("금액 숨기기": a phone on a shop counter is seen by customers). Remembered on the device. */
export const useAmountsHidden = () => useStore((state) => state.hidden);
export const useSetAmountsHidden = () => useStore((state) => state.setHidden);
