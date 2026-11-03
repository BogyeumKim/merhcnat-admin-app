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
  /** The blocks below are optional: a server that does not send them simply shows no such card. */
  failedCount: z.number().int().nullish(),
  /** The last 7 days, oldest first; the last entry is today. */
  weeklySales: z.array(z.object({ date: z.string(), amount: z.number().int() })).nullish(),
  recentTransactions: z
    .array(
      z.object({
        id: z.union([z.string(), z.number()]).transform(String),
        cardName: z.string(),
        time: z.string(),
        installment: z.string(),
        canceled: z.boolean(),
        amount: z.number().int(),
      }),
    )
    .nullish(),
  store: z
    .object({ normal: z.boolean(), bizNo: z.string(), settlementCycle: z.string(), settlementAccount: z.string(), services: z.string() })
    .nullish(),
});

export type HomeSummary = z.infer<typeof homeSummarySchema>;
