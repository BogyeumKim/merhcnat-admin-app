import { useQuery } from '@tanstack/react-query';

import { homeQueryKeys } from './query-keys';
import { fetchHomeSummary } from '../api/home-api';

/** 홈 수치는 매장 운영 중 자주 바뀌므로 1분 뒤 오래된 것으로 본다. 앱이 포그라운드로 돌아오면(`focusManager`) 다시 가져온다. */
const HOME_SUMMARY_STALE_MS = 60 * 1000;

/** 홈 수치 데이터. 갱신 중이거나 갱신이 실패해도 캐시된 데이터를 화면에 유지한다. */
export function useHomeSummaryData() {
  return useQuery({ queryKey: homeQueryKeys.summary(), queryFn: fetchHomeSummary, staleTime: HOME_SUMMARY_STALE_MS });
}
