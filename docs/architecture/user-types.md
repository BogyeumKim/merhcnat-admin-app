# 사용자 타입 / 계층 구조 설계

## 1. DB 계층 (사용자 설명)

| ID | 의미 |
| --- | --- |
| MID | 실제 가맹점 1:1 |
| GID | MID 여러 개를 가진 그룹 |
| VID | GID 여러 개를 가짐. **MID를 직접 여러 개 가질 수도 있음** |
| VGID | VID 여러 개를 가짐 (최상위) |

- 가맹점 원장 테이블: `MID`가 PK이고 해당 MID의 `GID`, `VID`가 함께 있다.
- VID에는 `L1_VID`, `L2_VID`, `L3_VID`가 있다. `L3_VID` = 딜러, `L2_VID` = 대리점, `L1_VID` = VID와 동일 값(총판 성격).
- 타입 `0`: 사업자번호(`coNo`)로 묶은 가상 그룹 (`cono`). 같은 사업자번호를 공유하는 MID들의 묶음.

## 2. 레거시 코드 재분석 결과 (정적 분석, 일부 추정)

위 DB 개념으로 코드를 다시 해석했다. 이전 분석(라벨로 추정)은 **틀렸다.**

**확인된 것**
- 계층 필터(`useVgrpFilter.js`의 `USR_TYPE_CONFIG`)가 **실제로 쓰이는 설정**이다. 타입별 `initialLevel`과 `levels`를 가진다.
- `selectTypeByReduxHandler`(타입 → `gvid/vid/l1vid/…` 키)는 **호출처가 없는 죽은 코드**다. 이 표는 근거로 쓰지 않는다.
- 계층 조회는 `GET v2/mobile/hierarchy?level=&parentId=`, 가맹점 조회는 `GET v2/mobile/merchants?level=&parentId=`. 레벨은 `l1`, `l2`, `l3`, `gid`이고 가맹점은 `mid`.
- 필터 결과는 `{l1Vid, l2Vid, l3Vid, gid, mid}`(기본값 빈 문자열)로 `transactions/list`, `transactions/sum`, `transactions/fail-history`, `store/list`, `deposits/list`, `deposits/sum`의 **쿼리스트링**에 붙는다.
- 클라이언트는 자기 자신의 vid/타입을 필터에 보내지 않는다. 범위는 토큰 기반 서버 판단이다(서버 코드는 미확인).
- GID 계정으로 로그인하는 타입은 코드에 없다. `gid`는 필터 레벨이자 응답 필드로만 나온다.
- 타입 5와 9는 필터 설정이 동일하다 (둘 다 `l1`에서 시작, `[l1, l2, l3, mid]`).

**확정된 해석 (사용자 확인): 필터에 보이는 레벨은 "자기 레벨 아래"다.**

| usr_type | 필터 시작/레벨 | 계정의 자기 레벨 | 보이는 하위 레벨 |
| --- | --- | --- | --- |
| 9 | `l1` / l1, l2, l3, mid | VGID | L1 → L2 → L3 → MID |
| 5 | `l1` / l1, l2, l3, mid | VID | L1 → L2 → L3 → MID |
| 4 | `l2` / l2, l3, mid | L1_VID | L2 → L3 → MID |
| 3 | `l3` / l3, mid | L2_VID (대리점) | L3 → MID |
| 2 | `gid` / gid, mid | L3_VID (딜러) | GID → MID |
| 1 | `mid` / mid (필터 UI 숨김) | MID (가맹점) | — |
| 0 | `mid` / mid | `cono` 가상 그룹 | MID들 |

- 이 표는 사용자가 확인했다 (맞다고 확정). 처음 설명한 타입 정의(3 = 그룹 가맹점, 5 = 대리점, 9 = 총판)는 이 표로 대체된다.
- 5(VID)와 4(L1_VID)는 값이 같은 `VID = L1_VID`라 클라이언트에서는 필터 시작 레벨만 다르다. 범위 차이는 서버가 정한다.
- 5와 9가 같은 이유(UI에 `vid`/`vgid` 레벨이 없음)와 서버에서의 차이는 코드에서 알 수 없다.
- VID가 직접 소유한 MID(L3 없음)를 앱이 어떻게 조회하는지는 코드에 없다 (`merchants`는 `level=l3` + 부모 id로만 조회). 서버 지원 여부 미확인.

**레거시의 보안 약점 (새 앱에서 계승하지 않는다)**
- SMS 결제 등 일부 요청 본문에 `usrType`, `usrTypeId`(자기 id)를 **클라이언트가 직접 보낸다.** 변조 가능하다. 새 앱은 타입/권한/소유 id를 요청에 실어 보내지 않고 서버가 토큰으로 판단한다.
- 필터 id는 평범한 쿼리 파라미터다. 서버가 토큰 대비 소유 범위를 검증해야 한다 (서버 쪽 확인 필요).
- 일부 라우팅이 `usr_type`이 truthy인지만 검사한다 (숫자 `0`이면 실패).

## 3. 확정된 정책

- 허용 타입: **0, 1, 2, 3, 4, 5, 9**. 타입 10은 서버가 로그인에서 막는다 (HTTP 200이 아닌 별도 status. 코드 값은 서버 제작 때 확정).
- 허용 목록 밖의 값은 `null`로 파싱하고 로그인을 진행하지 않는다.

## 4. 매직넘버 금지: 상수로 읽기 쉽게

`session.userType`을 읽을 때 `1`, `2` 같은 숫자를 코드에 쓰지 않는다. 숫자는 **한 파일에서만** 등장한다.

```ts
// features/auth/model/user-type.ts  (구현됨: UserType, isUserType, parseUserType. capability 맵은 미구현)
export const UserType = {
  BizGroup: 0, // 사업자번호로 묶은 가상 그룹 (cono)
  Mid: 1,      // 가맹점 (MID)
  L3Vid: 2,    // 딜러 (L3_VID) 
  L2Vid: 3,    // 대리점 (L2_VID)
  L1Vid: 4,    // L1_VID (총판 성격)  
  Vid: 5,      // VID           
  Vgid: 9,     // VGID          
} as const;

export type UserType = (typeof UserType)[keyof typeof UserType];

/** 로그인 응답(문자열/숫자 혼재)을 한 번만 파싱. 허용 목록 밖이면 null. */
export function parseUserType(raw: unknown): UserType | null {
  const value = typeof raw === 'string' ? Number(raw) : raw;
  return Object.values(UserType).find((type) => type === value) ?? null;
}
```

- **이름은 DB 컬럼 이름에 맞춘다** (`Mid`, `L3Vid`, …). 팀이 DB와 같은 용어로 읽을 수 있고, 정의가 아직 확정되지 않아도 틀린 한글 역할명(딜러/대리점)을 코드에 박지 않는다. 역할명은 주석으로만 둔다.
- `enum` 대신 `as const` 객체 + 유니온 타입을 쓴다 (런타임 코드가 없고 타입과 값이 한 곳).
- 타입 값은 `useSession()`이 `userType: UserType`으로 돌려준다 (`null`이면 로그아웃 상태).
- 값에 따른 분기는 **capability**로 한 번 변환한 뒤 화면은 capability만 읽는다. 비교가 필요할 때도 상수만 쓴다:

```ts
const { userType } = useSession();
if (userType === UserType.Mid) { … }          // O: 상수 비교 (capability 맵 안에서만)
if (userType === 1) { … }                      // X: 매직넘버
```

- 타입별 계층 드릴다운 설정도 상수를 키로 둔다:

```ts
const DRILL_DOWN: Record<UserType, { initial: Level; levels: readonly Level[] }> = {
  [UserType.Vgid]: { initial: 'l1', levels: ['l1', 'l2', 'l3', 'mid'] },
  [UserType.Vid]:  { initial: 'l1', levels: ['l1', 'l2', 'l3', 'mid'] },
  [UserType.L1Vid]: { initial: 'l2', levels: ['l2', 'l3', 'mid'] },
  [UserType.L2Vid]: { initial: 'l3', levels: ['l3', 'mid'] },
  [UserType.L3Vid]: { initial: 'gid', levels: ['gid', 'mid'] },
  [UserType.Mid]:  { initial: 'mid', levels: ['mid'] },
  [UserType.BizGroup]: { initial: 'mid', levels: ['mid'] },
};
```

`Record<UserType, …>`라서 새 타입이 추가되면 맵을 채우지 않을 때 **컴파일 에러**가 난다 (누락 방지).

## 5. 사용자 타입별 UI를 나누는 방식

(이전 조사 결론 유지, 블로그/튜토리얼 수준이지만 여러 곳에서 공통)

- 역할 비교 대신 capability로 화면 요소를 제어한다. 화면은 하나로 두고 요소/라우트를 게이트한다. 역할별로 화면을 따로 두자는 자료는 없었다.
- 파일 확장자(`.type1.tsx`)로 나누지 않는다. 확장자는 플랫폼 단위 번들 시점 규칙이고 타입은 런타임 값이다 (일반 지식, 이번에 문서로 재검증하지 않음).
- 레이아웃이 실제로 다른 화면만 `variant → 컴포넌트` 맵으로 선택한다.
- 탭/메뉴는 capability로 정하고 로그인 세션 동안 바뀌지 않게 한다.
- 클라이언트 검사는 보안 경계가 아니다. 서버가 토큰으로 범위를 정한다.
- WebView 화면의 타입별 분기는 웹 쪽이 서버 응답으로 처리한다.

레거시가 타입에 따라 달리하던 것: 1은 필터 UI 숨김·조회기간 제한 없음, 그 외는 계층 필터와 7일 기간 제한(최대 31일), 0은 `*ByGroupCoNo` 화면 세트와 MID 정보 노출, 1·0만 수기결제/SMS/선결제 노출, 1이 아닌 타입은 매출 순위/결제유형 차트 노출.

## 6. 미정 (사용자 확인 필요)

(이전 미정 1번 "타입 정의"는 확정됨)

1. GID 계정이 로그인하는 타입이 있는가? (코드에는 없음)
2. 5(VID)와 9(VGID)의 서버 범위 차이.
3. VID가 직접 소유한 MID(L3 없음)는 어떻게 조회하는가?
4. 서버 플래그(수기결제/SMS/선결제/정산주기)는 로그인 응답으로만 오는가?
5. 타입 0 전용 화면 세트(`*ByGroupCoNo`)가 새 앱에도 필요한가, WebView로 가는가?
