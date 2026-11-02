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

## 홈 요약과 설정 (갱신)

- 홈 위쪽은 가맹점 운영 요약이다: 오늘 매출(큰 숫자 + 어제 대비), 승인/취소 건수 타일, 다음 입금 예정 카드. 그 아래에 바로가기. 값은 `features/home/model/sample-summary.ts`의 **샘플 더미**이며 서버/WebView 연결 시 이 모듈을 쿼리로 바꾼다 (화면에 "샘플 데이터" 문구가 보인다).
- 설정은 탭이 아니라 전체메뉴의 `계정 > 설정`(`/settings`)에 둔다. 탭은 4개로 유지한다. 설정 화면(`features/settings`)은 OS 알림 권한 상태(포그라운드 복귀 시 다시 읽음, "기기 설정 열기"로 `Linking.openSettings`), 언어(ko/en), 앱 버전이다. 알림 허용/차단은 OS 권한이라 앱에서 직접 바꿀 수 없다.
- 참고한 패턴(검색 결과에서 확인된 것만): 당일 거래·매출 추이를 홈에 노출(Chase, Payrix), 정산 예정액을 홈에 노출(Faspay), 자주 쓰는 항목을 홈에 고정(Dialog eZ Cash 사례). 토스 사장님 앱의 홈 구성을 직접 다룬 자료는 찾지 못했다.
