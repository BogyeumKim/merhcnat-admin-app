import { usePathname } from 'expo-router';
import { useEffect } from 'react';

/** React 밖(QueryCache 콜백)에서 지금 화면을 확인하기 위한 마지막 경로. 루트 내비게이터가 갱신한다. */
let currentPath = '/';

export const getCurrentPath = () => currentPath;

/** 루트 스택에서 한 번만 호출한다. */
export function useTrackCurrentPath() {
  const pathname = usePathname();
  useEffect(() => {
    currentPath = pathname;
  }, [pathname]);
}
