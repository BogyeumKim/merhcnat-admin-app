---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# 사용자 타입별 UI 규칙

근거와 조사: `docs/architecture/user-types.md`

사용자 타입(백엔드 로그인 응답 `usr_type`): 허용 값은 `0, 1, 2, 3, 4, 5, 9`. `10`은 서버가 로그인에서 막는다(200이 아닌 별도 status). DB 계층은 MID < GID < VID < VGID이고 VID에는 L1/L2/L3_VID가 있다. 타입별 자기 레벨(확정): `9` VGID · `5` VID · `4` L1_VID · `3` L2_VID(대리점) · `2` L3_VID(딜러) · `1` MID(가맹점) · `0` 사업자번호 묶음(`cono`). 상수 이름은 DB 컬럼 기준(`Vgid`, `Vid`, `L1Vid`, `L2Vid`, `L3Vid`, `Mid`, `BizGroup`)이고 한글 역할명은 주석에만 쓴다 — 상세 `docs/architecture/user-types.md`.

- **컴포넌트에서 `userType === 1` 같은 비교를 쓰지 않는다.** 타입은 로그인 직후 **한 번만** 파싱(`string | number` → 유니온)하고, 화면은 capability(`canManualPay`, `showHierarchyFilter` …)만 읽는다.
- 타입별 차이는 `features/auth/model/`의 `타입 → capability` 맵 한 곳에서 정의한다. 서버가 내려주는 가맹점별 플래그(수기결제/SMS/선결제 등)는 같은 capability에 합친다.
- **파일 확장자로 나누지 않는다** (`.type1.tsx` 같은 방식). 확장자 해석은 플랫폼(ios/android) 단위의 번들 시점 규칙이고, 사용자 타입은 런타임 값이다.
- 레이아웃이 실제로 다른 화면만 변형 컴포넌트를 두고 `variant → 컴포넌트` 맵으로 선택한다. 나머지는 하나의 화면에서 capability로 요소를 켜고 끈다.
- 탭/메뉴 구성은 capability로 결정한다. 로그인 세션 동안 바뀌지 않으므로 네비게이터가 마운트되기 전에 확정한다.
- 클라이언트의 타입/권한 검사는 **보안 경계가 아니다.** 데이터 범위는 서버가 토큰으로 결정한다. 요청 payload의 타입 값을 서버가 신뢰하게 만들지 않는다.
- 허용 목록 밖의 값은 `null`로 파싱하고 로그인을 진행하지 않는다. 임의로 가장 가까운 타입으로 취급하지 않는다. `0`은 정상 값이므로 truthy 검사(`if (userType)`)를 쓰지 말고 `null` 여부로 판단한다 (레거시의 버그 위험).
- **매직넘버 금지.** `userType === 1`, `case 2:`처럼 숫자를 쓰지 않는다. 숫자는 `features/auth/model/user-type.ts`의 `UserType` 상수 객체(`as const`, DB 컬럼명 기반: `Mid`, `L3Vid`, `Vid`, `Vgid` …)에만 있다. `useSession()`은 `userType: UserType`을 돌려준다. 타입별 설정은 `Record<UserType, …>`로 써서 누락을 컴파일 에러로 잡는다.
- 요청 본문/쿼리에 사용자 타입이나 자기 소유 id(`usrType`, `usrTypeId` 등)를 실어 보내지 않는다 (레거시의 변조 가능 패턴). 서버가 토큰으로 판단한다.
