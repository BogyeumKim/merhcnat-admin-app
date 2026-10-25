---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# zustand 규칙 (클라이언트 UI 상태)

onebite-log의 패턴을 React Native에 맞게 옮긴 것. 설치는 첫 store를 만들 때 `npx expo install zustand`.

- zustand는 **UI 상태**(모달, 알림 다이얼로그, 화면 필터)에 쓴다. 서버 데이터는 TanStack Query. 로그인 토큰은 영속 저장하지 않는다. 메모리 전용 store는 가능하지만 `persist`를 붙이지 않는다 (`auth-jwt.md`).
- 상태는 판별 유니온으로 모델링한다 (`{ isOpen: false } | { isOpen: true; ... }`).
- `combine(initialState, set => ({ actions: { ... } }))` 형태로 `actions` 객체를 둔다.
- store 자체를 export하지 않고 **선택자 훅만** export한다 (`useOpenAlertModal`, `useAlertModal`). 액션 훅은 `actions.x`만 구독해 불필요한 리렌더를 막는다.
- store 파일 위치: feature 전용이면 `features/<f>/model/`, 앱 전역(알림 다이얼로그 등)이면 `shared/model/`.
- 모달 렌더링은 `core/providers`의 호스트 컴포넌트 하나가 store를 구독해 그린다. 화면마다 모달을 직접 렌더하지 않는다.
- `devtools` 미들웨어는 RN에서 브라우저 확장이 없어 쓰지 않는다.
- `persist`는 비민감 값만, `partialize`로 필요한 키만 저장한다. 저장소는 `createJSONStorage`에 `shared/lib/storage`를 연결한다.

## 이 프로젝트의 store (구현됨)

- `features/auth/model/session-store.ts`: `userType`만 보관(영속 저장 없음). `useSession()`은 `useShallow`로 `{ userType, isSignedIn }`을 돌려주고, 로그인 여부는 `userType !== null`. 액션은 `completeSignIn`/`signOutLocally` 함수로 노출한다.
- `features/auth/model/auth-flow-store.ts`: 진행 중인 추가 인증(챌린지). 메모리 전용.
- 토큰은 store가 아니라 `shared/api/session-token.ts`(모듈 변수)에 있다: API 클라이언트가 React 밖에서 읽고 교체해야 해서.
