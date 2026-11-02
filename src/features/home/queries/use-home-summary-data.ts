import { useQuery } from '@tanstack/react-query';

import { fetchHomeSummary } from '../api/home-api';

export const homeQueryKeys = { summary: ['home', 'summary'] as const };

/** The home figures. Cached data stays on screen while a refresh runs or fails; coming back to the app refetches them. */
export function useHomeSummaryData() {
  return useQuery({ queryKey: homeQueryKeys.summary, queryFn: fetchHomeSummary, staleTime: 60 * 1000 });
}
