---
paths:
  - "src/**/*.tsx"
---

# 폴더블·넓은 창 레이아웃 규칙 (iPhone Duo / Galaxy Fold / 태블릿 / 리사이즈 창)

모든 화면과 컴포넌트는 접힌 폰, **펼친 iPhone Duo·Galaxy Fold**, 태블릿, iOS 27 리사이즈 창(창 폭이 수시로 바뀜)에서 정상이어야 한다.
`.claude/hooks/check-adaptive-layout.sh`(PostToolUse)가 아래 금지 패턴을 자동으로 막는다. 근거: `docs/architecture/responsive-ui.md`.

## 원칙

- **기기가 아니라 창 크기로만** 분기한다: `useWindowLayout()`(`widthClass`, `isWide`, `isShort`, `fontScale`). 실측: 같은 iPhone Duo에서도 창 폭이 466pt·951pt로 바뀌었다.
- **콘텐츠는 `CONTENT_MAX_WIDTH`(528dp, 좌우 여백 포함)로 가운데 정렬**한다. 넓은 창에서 입력창·버튼·목록이 창 끝까지 늘어나거나 왼쪽으로 쏠리면 안 된다.
  - 폼/시트/탭 본문: `BrandedFormScreen` · `SheetFormScreen` · `PlainFormScreen` · `TabScreen` → `NativeFormScroll` → `FormColumn`/`FormFooter`가 이미 가운데 정렬한다. 새 화면은 반드시 이 셸을 쓴다.
  - 셸 밖에서 `@expo/ui` 컬럼을 직접 만들면 `useContentWidthModifiers()`(`shared/ui/content-width`)를 `modifiers`로 주고, 부모 `Column`에 `alignment="center"`.
  - RN `View` 래퍼는 `{ width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center' }`.
  - 범용 `@expo/ui` `style`에는 maxWidth가 없다. iOS는 `frame({ maxWidth })`, Android는 `width(CONTENT_MAX_WIDTH)`(Compose에 widthIn 미노출, `width`는 부모 제약 안으로 맞춰져 좁은 부모에서는 부모 폭) — `content-width.*`에 이미 있다. 최대 폭 modifier와 패딩은 다른 `Column` 층에 둔다(`ContentColumn`): Android는 `style` 패딩이 사용자 modifier보다 바깥이라 같은 층이면 528 + 패딩이 된다.
- **로그인 셸(`BrandedLayout`)은 `isSplit`(넓고 가로·정사각형에 가까운 창: 펼친 Duo 가로, 펼친 Fold)에서 좌우 분할**한다(Korpay 리디자인 PDF). 왼쪽 `canvas`에 로고·문구, 오른쪽에 폼, 정확히 반씩 나눠 접히는 선을 넘는 요소가 없게 한다. 세로로 긴 넓은 창은 한 컬럼 가운데 정렬.
  - 반반은 두 영역에 `width: '50%'`로 준다. 패딩이 있는 영역끼리 `flex: 1`로 나누지 않는다: Yoga는 flex-basis 0을 영역의 패딩 합 이상으로 올려 잡아, 패딩이 큰 쪽이 그만큼 넓어진다(펼친 Fold 실측 왼쪽 54%, 816dp 중 440dp). safe area·여백은 50% 영역 **안쪽** View에만 준다(좌우 인셋이 달라도 경계는 창 가운데에 남는다).
  - 탭 화면 상단 바(`AppHeader`) 같은 셸 밖 RN 행도 본문과 같은 `CONTENT_MAX_WIDTH`로 가운데 둔다(창 끝까지 늘리지 않는다). 다른 화면도 접히는 선(화면 가운데)을 가로지르는 입력·버튼을 만들지 않는다.
- 막대처럼 남는 폭을 채우는 요소는 폭을 계산하지 말고 유연한 `Spacer`(iOS `Spacer`, Android `weight(1)`)로 둔다(`StepBars`: 라벨·버튼이 자연 폭을 먼저 받는다). 같은 칸을 나란히 늘어놓는 행(OTP 6칸)도 칸 폭을 창 폭으로 계산하지 않는다: 칸마다 `FILL_ROW`(iOS `frame(maxWidth: .infinity)`, Android `weight(1)`)를 줘 부모 콘텐츠 폭을 똑같이 나눈다(창보다 좁은 폼 시트에서 계산이 어긋난다). 겹치는 입력란도 같은 유연 크기로 채운다.
- **탭 바**: Android `NativeTabs`(expo-router 58, react-native-screens 4.30)는 Material `BottomNavigationView`만 쓴다. 내비게이션 레일/adaptive navigation suite 옵션이 없다(iOS만 `sidebarAdaptable`/`preferredPlacement`). 넓은 창에서도 하단 탭을 그대로 두고, JS 레일/커스텀 탭 바를 만들지 않는다(`bottom-tabs.md`).
- **헤더 없는 전체 화면의 위쪽 여백은 `useScreenTopInset()`**(`shared/lib`)을 쓴다. 창 모드에서는 왼쪽 위 창 컨트롤(●●●)이 safe area top만으로는 로고/제목과 겹친다.
- **폼 시트**(`presentation: 'formSheet'`)는 넓은 창에서 시트 폭이 창보다 좁거나 넓을 수 있다. 시트 내용은 `SheetFormScreen`(→ `FormColumn` 가운데 정렬)으로만 그린다. 창 폭으로 시트 내용 폭을 계산하지 않는다(iOS는 `frame(maxWidth)`가 실제 시트 폭을 따른다). 좌우 safe area도 창 기준 `useSafeAreaInsets()`를 시트에 쓰지 않는다(창 가장자리 인셋이 시트 안쪽 여백이 되어 한쪽으로 쏠렸다, 펼친 Duo 실측): `SheetFormScreen`은 네이티브 `SafeAreaView`(시트 실제 프레임 기준)를 쓴다.
- **시트 폭(플랫폼 관례, 창 폭 + 플랫폼으로만 분기)**: iOS는 네이티브 page sheet(넓은 창에서 시스템이 가운데 카드로 띄움, 손대지 않는다). Android는 M3 바텀 시트: 창 폭이 `SHEET_MAX_WIDTH`(640dp, M3 `BottomSheetDefaults.SheetMaxWidth`)보다 넓으면 640dp로 가운데. react-native-screens 4.30.1 Android 시트는 최대 폭 옵션이 없어(CoordinatorLayout + BottomSheetBehavior, 항상 창 전체 폭) `sheetOptions(…, floating)`이 네이티브 시트를 투명·`sheetElevation: 0`으로 두고, 내용의 `SheetSurface`(`shared/ui/sheet-surface`)가 640 카드(배경·위쪽 모서리 28)를 그린다. 닫을 수 있는 시트는 카드 양옆 탭으로 닫힌다. 시트 내용은 반드시 `SheetFormScreen` 또는 `SheetSurface` 안에 둔다. 폰(≤640)은 카드가 시트를 꽉 채워 기존과 같다. 네이티브 배경·elevation은 시트 생성 때 한 번 읽히므로 연 채로 접기/펼치기하면 연 시점 모양이 유지된다.
- Android universal `ScrollView`는 폭 지정이 없으면 느슨한 제약을 받아 내용 폭으로 줄고 왼쪽에 붙는다(그 아래 `'100%'`는 정확한 폭에서만 풀린다). `NativeFormScroll`(Android)은 스크롤에 `fillMaxWidth()`를 줘 본문이 푸터와 같이 가운데 오게 한다.
- 로고 이미지는 `BrandLogo`처럼 **폭을 명시**한다. 높이+비율+`maxWidth: '100%'`만 주면 내용 크기를 따르는 부모에서 폭이 0이 되어 사라진다.

## 금지 (훅이 차단)

- `Dimensions.get()`(창 크기 변화에 갱신 안 됨) → `useWindowLayout()`/`useWindowDimensions()`. 예외: `use-screen-top-inset.ts`의 화면 크기 비교(.ts).
- 기기 종류/모델 분기(`deviceType`, `modelName`, `isTablet` …).
- 300dp 이상 고정 `width`.
- `screens/`에서 universal `ScrollView` 직접 사용.

## 화면 완료 전 체크리스트

| 시나리오 | 확인 |
| --- | --- |
| 접힌 폰 / 320dp 좁은 창 | 잘림·가로 스크롤 없음 |
| 펼친 iPhone Duo·Galaxy Fold(세로/가로) | 콘텐츠가 가운데 최대 폭, 한쪽 쏠림 없음, 로고/제목 표시 |
| 폼 시트를 펼친 상태에서 열기 | 시트 안 내용 가운데(본문·푸터 같은 축), 버튼이 시트 폭을 넘지 않음. Android는 시트가 640dp 가운데 카드 |
| iOS 27 창 모드, 창 크기 조절 | 창 컨트롤과 겹침 없음, 크기 바꿔도 입력값 유지 |
| 접기↔펼치기 전환 | 레이아웃 재구성, 입력 중 텍스트 유지 |
| 큰 글꼴 / 가로 / 다크 | `responsive-ui.md` 체크리스트 |

## iPhone Duo 시뮬레이터 확인 방법

- `xcrun simctl io screenshot`은 Duo에서 검은 화면만 나온다(Duo는 화면 표면이 2개라 비활성 표면을 찍음). **`expo-device-hub`(devDependency)에 포함된 `serve-sim`으로 찍는다.**
  - 스트림 시작: `node node_modules/expo-device-hub/vendor/serve-sim/dist/serve-sim.js -p 3200 --single-device <udid> <udid>`
  - 캡처: `curl -s -X POST -H 'content-type: application/json' -d '{}' -o shot.png localhost:3200/api/screenshot` (현재 접힘 상태의 실제 화면)
  - 접기/펼치기: `serve-sim.js hinge fold|half|unfold -d <udid>`, 현재 각도는 `hinge -d <udid>`
- 탭/입력은 **`agent-device`**(`npx -y agent-device open <bundleId> --platform ios --udid <udid> --foreground` → `snapshot -i`, `press @eN --settle`, `fill @eN <text>`, `keyboard status`, `screenshot <path>`, `fold open|closed`)로 한다. 접근성 트리(ref)로 누르므로 좌표가 필요 없고 Duo에서 동작한다(2026-11-22 확인). `serve-sim.js tap|type`은 `event-log`에만 기록되고 Duo 앱에는 반영되지 않는다. 사람이 Device Hub(http://localhost:3400)로 같은 기기를 쓰는 중이면 CLI 조작을 멈추고 먼저 묻는다.
- 화면 치수: 접힘 466×678pt(오른쪽 카메라 영역 safe area 84pt), 펼침 951×669pt.
- 실제 값이 필요하면 `console.log` → `xcrun simctl spawn <udid> log show --info --predicate 'eventMessage CONTAINS "..."'`. 확인하지 못한 항목은 보고한다.
