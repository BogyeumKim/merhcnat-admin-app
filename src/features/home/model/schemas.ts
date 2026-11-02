import { z } from 'zod';

/** `GET /api/home/summary` `data` (docs/backend-contract/home-summary.md). Amounts are whole won. */
export const homeSummarySchema = z.object({
  storeName: z.string(),
  todaySales: z.number().int(),
  approvalCount: z.number().int(),
  cancellationCount: z.number().int(),
  /** No payout scheduled yet: both fields are absent/null. */
  nextDepositAmount: z.number().int().nullish(),
  /** ISO date (YYYY-MM-DD). */
  nextDepositDate: z.string().nullish(),
  monthSales: z.number().int(),
  /** The server says whether this account may request an advance payout (the per-merchant switch). */
  prepayAvailable: z.boolean(),
  latestNotice: z
    .object({ id: z.union([z.string(), z.number()]).transform(String), title: z.string(), date: z.string() })
    .nullish(),
});

export type HomeSummary = z.infer<typeof homeSummarySchema>;
