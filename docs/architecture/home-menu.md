# 홈 / 전체메뉴 / 탭 구성

레거시(`mms-mobile`)는 홈에 카드·차트·배너를 길게 늘어놓고 타입별 분기를 화면마다 했다. 새 앱은 **카테고리로 묶고**, 홈은 짧게 둔다.

## 구조

- 탭 4개: 홈 · 거래내역 · 가맹점 · 전체메뉴 (`core/navigation/app-tabs/config/tabs.ts`). 거래내역/가맹점은 WebView로 채울 자리(지금은 안내 화면).
- **홈**: 오늘 요약 카드(자리) + **바로가기**(자주 쓰는 항목 몇 개). 나머지는 전체메뉴로 보낸다.
- **전체메뉴**: 결제 · 조회 · 정산 · 고객지원 카테고리별 목록 + 로그아웃. 카테고리가 이동 단위다 (그룹을 고르고 항목을 연다).
- 항목은 `/feature/[id]` 안내 화면으로 열린다. 각 항목의 화면(대부분 WebView)이 생기면 `openMenuItem`의 경로만 바꾼다.

## 단일 출처

- `features/menu/model/catalog.ts`: 카테고리와 항목(`MENU_CATALOG`). 항목마다 필요한 capability(`requires`)와 홈 바로가기 여부(`shortcut`).
- `features/auth/model/capabilities.ts`: 계정 타입별 capability 맵(`Record<UserType, Capabilities>`). 화면은 `useCapabilities()`만 읽고 타입 숫자를 비교하지 않는다.
- 새 항목: `MenuItemId`, `MENU_CATALOG`, `model/icons.ts`(SF Symbols + Material), i18n `menu.items.<id>`(ko/en)를 함께 추가한다.

## capability 현재 값 (레거시 분석 기준)

| capability | 의미 | 타입 |
| --- | --- | --- |
| `canPay` | 수기결제/SMS결제/선지급 노출 | 0, 1 |
| `canLookUpPreferredBusiness` | 우대사업자 조회 | 2, 3, 4, 5, 9 |
| `showHierarchyFilter` | 계층 필터(L1→L2→L3→MID) | 2, 3, 4, 5, 9 |
| `storeInfo` | `detail`(자기 가맹점 상세) / `list`(하위 가맹점 목록) | 1은 detail, 나머지 list |

가맹점별로 서버가 주는 스위치(수기결제/SMS/선결제 사용 여부)는 로그인 응답 계약이 정해지면 `canPay`에 합친다. 클라이언트의 capability는 보안 경계가 아니다 (서버가 토큰으로 범위를 정한다).

## 홈 / 전체메뉴 디자인 (2차 갱신)

참고: Designus 레퍼런스(앱 화면 모음)에서 올리브영, 치지직, 트래블월렛 등을 확인했다. 공통 패턴은 ① 상단 바: 왼쪽 브랜드 로고, 오른쪽 알림(검색) 아이콘 ② 홈 첫 화면은 핵심 숫자/잔액 카드 하나 ③ 하단 탭 아이콘. 다음 항목은 근거가 약해 빼거나 옮겼다.

- 홈(4차): 토스뱅크/신한 SOL/트래블월렛 캡처 분석(카드-온-캔버스, 굵은 제목 + `>`, 아이콘 배지 + 라벨 + 굵은 금액 + 작은 톤 버튼, 차트 없음)을 따른다. `TabScreen canvas` 위의 흰 `HomeCard`들: 가맹점 카드(가맹점명 >, 오늘 매출 [내역], 다음 입금 예정 [조회], 승인/취소 건수) → 이번 달 매출 [내역] → 선지급 프로모션 카드(선지급 가능 계정만, `PrepayBanner`) → 고객지원 카드(공지사항/FAQ 행, `SupportCard`). 아이콘 그리드는 전체메뉴와 중복이라 뺐다. 값은 `model/sample-summary.ts`의 샘플 더미.
- 색 토큰 `canvas`/`card`/`tonal`을 `shared/theme/colors.ts`에 추가했다(라이트/다크 둘 다).
- 이전 기록: mms-mobile 홈은 공지 마키 → 오늘 매출 → 정산금액 → 결제 숏컷 → 배너 → 추이 차트 → 결제유형 → 순위 → FAQ였다. 근거 조사: 오늘얼마(오늘 매출 + 입금 예정), 쿠팡이츠 사장님, 요기요 사장님. 서버 요약 값의 형태는 확정 전이다.
- 전체메뉴: `AppHeader` + 카테고리 제목 + 아이콘/설명 없는 텍스트 행(chevron만). 설정은 `계정 > 설정`(`/settings`: OS 알림 권한 상태, 언어, 버전). 탭은 4개 유지.
- 알림 아이콘은 지금 공지사항 placeholder로 이동한다. 알림함 API가 생기면 별도 화면으로 바꾸고 미확인 표시(점)를 붙인다.
