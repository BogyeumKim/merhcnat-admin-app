import { z } from 'zod';

/** `GET /api/home/summary` `data` (docs/backend-contract/home-summary.md). 금액은 원 단위 정수. */
export const homeSummarySchema = z.object({
  storeName: z.string(),
  todaySales: z.number().int(),
  approvalCount: z.number().int(),
  cancellationCount: z.number().int(),
  /** 예정된 정산이 아직 없음: 두 필드 모두 없거나 null. */
  nextDepositAmount: z.number().int().nullish(),
  /** ISO 날짜(YYYY-MM-DD). */
  nextDepositDate: z.string().nullish(),
  monthSales: z.number().int(),
  /** 이 계정이 선정산을 신청할 수 있는지 서버가 알려준다(가맹점별 스위치). */
  prepayAvailable: z.boolean(),
  latestNotice: z
    .object({ id: z.union([z.string(), z.number()]).transform(String), title: z.string(), date: z.string() })
    .nullish(),
  /** 아래 블록은 선택 사항: 서버가 보내지 않으면 해당 카드를 표시하지 않는다. */
  failedCount: z.number().int().nullish(),
  /** 최근 7일, 오래된 순. 마지막 항목이 오늘. */
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
