# 홈 요약 계약 (server 세션이 구현, 앱이 연동함)

`GET /api/home/summary` (Bearer, 기존 `{code,message,data}` 엔벨로프). 데이터 범위는 서버가 토큰으로 정한다(앱은 계정 정보를 보내지 않는다).

```json
{
  "code": "SUCCESS",
  "data": {
    "storeName": "테스트 가맹점",
    "todaySales": 1250000,
    "approvalCount": 38,
    "cancellationCount": 2,
    "nextDepositAmount": 3480000,
    "nextDepositDate": "2026-11-04",
    "monthSales": 28430000,
    "prepayAvailable": true,
    "latestNotice": { "id": "3", "title": "…", "date": "2026-11-03" }
  }
}
```

- 금액은 원 단위 정수. `nextDepositAmount`/`nextDepositDate`가 없거나 null이면 "예정 없음". `latestNotice`는 선택(고객지원 카드의 공지사항 행 부제).
- `prepayAvailable`은 서버의 가맹점별 선지급 스위치다. 앱은 이 값과 계정 타입(capability) 둘 다 허용일 때만 선지급 카드를 보여준다.
- 앱 쪽: `features/home/api/home-api.ts`(zod 검증), `queries/use-home-summary-data.ts`. 로딩/실패(재시도)/캐시 유지 상태가 있다.
- 현재 서버 값은 더미(서버 세션이 알려 줌). 확인: 로컬 서버에 `1234` 계정으로 로그인 → 이 엔드포인트가 위 형태로 200을 준다.
