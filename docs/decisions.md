# 결정 기록

| 날짜 | 결정 | 비고 |
| --- | --- | --- |
| 2026-10 | SDK 58, UI는 `@expo/ui`, 로컬 prebuild(EAS dev build 미사용) | `AGENTS.md` |
| 2026-10 | iOS/Android 전용. web 제거. 웹 화면은 별도 React 프로젝트를 WebView로 | `docs/architecture/webview.md` |
| 2026-10 | 구조: 탭/도메인별 모듈(feature-first). FSD 미채택 | `docs/architecture/feature-first.md` |
| 2026-10 | 서버 상태 TanStack Query, UI 상태 zustand, i18n 한국어/영어 | `.claude/rules/` |
| 2026-10 | 설정 저장소는 `expo-sqlite/kv-store` 유지. **MMKV로 바꾸지 않는다** | `docs/architecture/storage-env-testing.md` |
| 2026-10 | 허용 사용자 타입 0,1,2,3,4,5,9. 타입 10은 **HTTP 200이 아닌** 별도 status로 서버가 막음 | 타입별 자기 레벨은 아래 행에서 확정 (`user-types.md`) |
| 2026-10 | 사용자 타입은 매직넘버 금지: `UserType` 상수 객체(DB 컬럼명 기반)로만 접근 | `.claude/rules/user-types.md` |
| 2026-10 | JWT, **refresh token 없음**, 앱 실행마다 로그인 필수(토큰 영속 저장 안 함), 서버가 만료 임박 시 토큰을 연장(슬라이딩) | `docs/architecture/auth-jwt.md` |
| 2026-10 | OTP 타입 0 = TOTP: **매 로그인** 서버 검증(코드 저장 안 함). 타입 1 = 문자/메일/카카오: **기기 등록·교체 시 최초 1회만** 인증(사용자가 수단 선택, 서버가 랜덤 코드 해시 저장·발송). 같은 기기 재로그인은 ID/비밀번호만 | `docs/architecture/device-binding.md` |
| 2026-10 | 재설치를 같은 기기로 알아본다: Android `ANDROID_ID`(서버는 해시 저장) + 설치 UUID, iOS Keychain UUID(대개 유지, 보장 불가 → 못 알아보면 재인증 폴백). IDFV는 쓰지 않음 | `device-binding.md` (스토어 정책 확인 필요). **2026-11 "재설치 = 새 기기"로 대체됨** |
| 2026-10 | 한 기기 = 한 userId (1:1). 다른 계정 로그인 시 인증 후 바인딩을 덮어씀 | `device-binding.md` |
| 2026-10 | DB는 MySQL, 서버는 Spring Boot + JDK 25. API 계약은 `docs/backend-contract/app-migration-server-login.md`(`/api/...`, `{code,message,data}`, `Access-Token` 응답 헤더) | 서버는 별도 저장소 |
| 2026-10 | HTTP 클라이언트는 전역 `fetch`(= `expo/fetch`) 얇은 래퍼 | `docs/architecture/api-conventions.md` |
| 2026-10 | 오류는 200이 아닌 status + `code`, 앱이 i18n. 점검은 `503` + 구조화 필드 | `api-conventions.md` |
| 2026-10 | 사용자 타입 표 확정: 9 VGID · 5 VID · 4 L1 · 3 L2(대리점) · 2 L3(딜러) · 1 MID · 0 사업자번호 묶음 | `docs/architecture/user-types.md` |
| 2026-10 | 루팅 탐지(freeRASP/jail-monkey)와 기기 키쌍은 우선 미구현 | 기기 바인딩은 식별자 + 서버 기준으로 설계 |
| 2026-10 | Git hooks(husky/commitlint), Unistyles 제외. Jest는 테스트할 로직이 생길 때 | (RNCopilot 검토: 기존 Claude hooks·ESLint 엄격 규칙·i18n만 채택) |
| 2026-10 | 문자·카카오는 엠엔와이즈, 메일은 Outlook으로 발송. 서버 작업은 보류하고 앱에 집중 | `docs/backend-contract/server-stack.md` |
| 2026-10 | 새 계정은 기기 값 없음(NULL/행 없음). 비밀번호 초기화는 기기 값 유지. 기기 초기화 기능과 이전 기기 알림은 만들지 않음 | 서버 정책 |
| 2026-10 | 푸시는 Expo Push Service 권장(Expo 앱 기본 선택, EAS 프로젝트·자격 증명 필요, 본문에 민감 정보 금지). 구현은 사용처가 정해질 때 | `device-binding.md` |
| 2026-10 | 키보드/스크롤은 `@expo/ui` 네이티브 방식(iOS SwiftUI 키보드 세이프에어리어, Android `imePadding`). `react-native-keyboard-controller`는 Android Compose 입력창을 인식하지 못해 제거 | `docs/architecture/responsive-ui.md` (기기 확인 필요) |
| 2026-10 | 시스템 글꼴 크기 추종: 문구는 RN `Text`/`NativeText`(iOS는 SwiftUI text style), `@expo/ui` Text의 `fontSize`는 iOS 고정 크기라 사용 금지 | `responsive-ui.md` |
| 2026-10 | 반응형은 창 크기 기준(600/840dp), 두 단 레이아웃, `orientation: default`. 로고는 `expo-image` + SVG(`svgVariables`) | `responsive-ui.md` |
| 2026-10 | 로그인 화면·추가 인증·점검·에러 바운더리 구현. 서버 전까지 개발용 mock(릴리스 번들에서 제거) | `docs/architecture/login-ui.md` |
| 2026-10 | 서브에이전트 리뷰(SDK 58 일치 + 성능/접근성) 반영: 토큰 수락 규칙, 세션 세대 카운터, 타임아웃 판별, 색 대비 재계산, 라벨/낭독, 자동 제출 | `docs/architecture/login-ui.md` |
| 2026-10 | 로고를 기존 회사 로고 정체성(빨강 #ff003a, 흰 K 원형 마크, 차콜 Kor + 빨강 pay)으로 다시 제작. 빨강은 로고/그래픽 전용, 버튼·링크는 대비를 맞춘 `action` 색 | `docs/architecture/responsive-ui.md` |
| 2026-10 | 폼은 react-hook-form + zod(`@hookform/resolvers` 5.x 고정). 검증 메시지는 코드, UI에서 번역 | `docs/architecture/feedback-ux.md` |
| 2026-10 | 토스트는 sonner-native(`shared/ui/toast.ts` 뒤). 오류는 종류별로 인라인/토스트/점검 화면으로 나눠 표시, 같은 id는 갱신 | `feedback-ux.md` |
| 2026-10 | 인라인 `style`은 성능 문제가 아님을 확인(RN 문서: StyleSheet.create는 항등 함수, React Compiler 47/47 컴파일). `npm run check:compiler`로 bail-out 점검 | `docs/architecture/styling-performance.md` |
| 2026-11 | 토큰은 SecureStore가 아니라 zustand vanilla 메모리 store(`shared/api/session-token.ts`, `persist` 없음). 앱 재실행 = 재로그인 | `docs/architecture/auth-jwt.md` |
| 2026-11 | 하단 탭은 iOS/Android 모두 항상 `NativeTabs`. 네이티브(`@expo/ui`·네이티브 모듈) 우선, JS 라이브러리는 네이티브로 안 될 때만. 탭바 검토 기록 문서 삭제 | `.claude/rules/bottom-tabs.md` |
| 2026-11 | 로그인 화면의 "아이디 저장"과 하단 발급 안내 카드 삭제 (하단은 앱 버전만). 서버 계약 초안(`auth-device.md`, `conventions.md`) 삭제 | `docs/architecture/login-ui.md` |
| 2026-11 | 폴더블·넓은 창: 로그인 두 단 레이아웃 폐기 → 모든 창 한 컬럼 + `CONTENT_MAX_WIDTH` 가운데 정렬(폼·시트 공통), 창 모드 컨트롤 여백, 금지 패턴 차단 훅 | `.claude/rules/adaptive-layout.md` |
| 2026-11 | iOS 27 `-[UIApplication statusBarStyle]` 로그: 원인은 Info.plist `UIViewControllerBasedStatusBarAppearance=false`(prebuild 템플릿 기본값)로 RN `RCTStatusBarManager`가 폐기 API 경로를 탐. `app.json`에서 `true`로 변경 | `app.json` |
| 2026-11 | SDK 58 패치 일괄 업데이트(`expo` 58.0.26, `@expo/ui` 58.0.29, `expo-router` 58.0.32, RN 0.88.1 등, `expo-doctor` 20/20). `expo-device-hub` devDependency 추가(Duo 캡처). 스킬 갱신: vercel 프로젝트 스킬 2개, 전역 3개, `expo-sqlite` 동봉 스킬 링크 | `docs/README.md` |
| 2026-11 | 리디자인 PDF 반영: 펼친 폴더블 로그인 좌우 분할, 이메일 인증 채널, 채널별 마스킹 수신처·"최근 사용", 인증번호 6칸, 연락처 없음 안내. 서버 계약: 200은 성공만, 401 `MFA_REQUIRED`/403 `PASSWORD_CHANGE_REQUIRED`, 연락처 없음은 빈 `channels`(409 아님), status→code 순 분기 | `docs/backend-contract/app-migration-server-login.md` |
| 2026-11 | 보안 변경 반영: 기기 비밀키(SecureStore) 도입, 로그인 실패 data 제거, 다른 계정 기기 표시(아이디 미노출), 90일 만료는 `reason`으로 문구 구분, 입력 길이 상한, 채널별 재전송·발송 한도, 챌린지 발송 시 연장(최대 15분) | `docs/backend-contract/app-migration-server-login.md` |
| 2026-11 | 단일 세션: 401 `SESSION_REPLACED`/`SESSION_EXPIRED`/`UNAUTHORIZED`는 로그아웃 + 캐시 삭제 + 이유별 로그인 안내, 503 `SESSION_STORE_UNAVAILABLE`은 로그아웃 없이 토스트·재시도(점검 아님), 로그인 중 비밀번호 변경 성공 시 로컬 로그아웃 후 재로그인, 비밀번호 문자 집합을 서버 정책(ASCII 영문·숫자·기호)에 맞춤, 유휴 15분 | `docs/backend-contract/app-migration-server-login.md` |
| 2026-11 | 재설치 = 새 기기(iOS/Android 모두 재인증). iOS Keychain은 앱 삭제 후에도 남으므로 설치 후 첫 실행에 SecureStore 기기 값(`device.id`/`device.secret`/레거시 `login.savedUserId`)을 지운다(설치 표식은 kv-store). **2026-10 "재설치를 같은 기기로 알아본다" 행을 대체** | `device-binding.md`, `features/auth/model/fresh-install.ts` |
| 2026-11 | 로그인 중 비밀번호 변경은 로그인 유지: 서버가 `Access-Token` 헤더로 새 토큰을 주고 세션을 교체(이전 토큰 `SESSION_REPLACED`), 앱은 토큰 교체 + 변경 요구 해제 + 성공 토스트. 세션 종료 이유 `passwordChanged`와 재로그인 안내 삭제. **같은 달 "성공 시 로컬 로그아웃 후 재로그인"을 대체** | `docs/backend-contract/app-migration-server-login.md` |
| 2026-11 | 아이콘 중앙 맵 `shared/ui/icons.ts`(의미 이름 → `Icon.select` SF Symbols/Material Symbols 쌍, 플랫폼별 세트는 의도). 화면 인라인 쌍·XML import 금지, 훅 `check-icon-map.sh`로 차단. 탭 아이콘은 `NativeTabs` API라 `tabs.ts`에 둠 | `.claude/rules/expo-ui.md` |
| 2026-11 | OTP 발송 한도 단순화: 챌린지당 모든 채널 합쳐 5회만(6번째 429 `OTP_SEND_LIMIT_EXCEEDED`, `data` 없음). 앱은 토스트 + 인증 시트 닫기로 처음부터 로그인, 대기 시간 안내(`sendLimitWait`) 삭제. 같은 채널 60초 쿨다운·채널 즉시 전환은 유지, `otp/send`의 `remainingSends`는 선택(화면 미사용). **같은 달 "사용자당 시간당 10회 + `retryAfterSeconds` 대기 안내" 규칙을 대체** | `docs/backend-contract/app-migration-server-login.md` |
| 2026-11 | 같은 채널 재발송 대기(60초 쿨다운, 429 `OTP_RESEND_TOO_SOON`) 삭제: 카카오톡 → 실수로 문자 → 다시 카카오톡을 막지 않도록 챌린지당 5회 안의 모든 발송은 즉시 나간다(6번째는 기존대로 429 `OTP_SEND_LIMIT_EXCEEDED`). 앱은 수단 카드의 "N초 후 다시 받을 수 있어요"(`channelWait`)·수단별 `cooldowns`를 지우고, 유효한 보낸 수단을 고르면 재발송 없이 입력으로 돌아가는 동작은 유지. `resendAfterSeconds`는 코드 입력 화면 "N초 후 다시 받기" UI 타이머로만 쓴다. `OTP_RESEND_TOO_SOON`은 이전 서버 호환으로 인라인 처리만 남김. **같은 달 "같은 채널 60초 쿨다운 유지"(발송 한도 단순화 행)와 채널별 재전송 행을 대체** | `docs/backend-contract/app-migration-server-login.md` |
| 2026-11-22 | 인증 수단 카드는 누를 때마다(같은 수단 포함) 항상 새 코드를 보낸다. "보낸 인증번호 입력하기"(`channelSent`) 카드 상태와 유효한 코드로 재발송 없이 돌아가는 동작을 삭제(일관된 UX). 발송 한도(챌린지당 5회, 6번째 429 → 토스트 + 시트 닫기)는 그대로. 시트 상단 텍스트 "닫기"는 X 아이콘 버튼(`icons.close`, 44pt)으로 바꾸고 수단 선택의 하단 단독 "닫기"는 제거. **2026-11 "같은 채널 재발송 대기 삭제" 행의 "재발송 없이 입력으로 돌아가는 동작은 유지"를 대체** | `docs/architecture/login-ui.md` |
| 2026-11-22 | 비밀번호 변경 규칙 "아이디 포함 금지"를 앱에서도 힌트로 판정: 로그인 아이디를 세션 메모리(`session-store` `userId`, `persist` 없음, 서버 `data.userId` 우선·없으면 입력값, 임시비밀번호 흐름은 `temp-password-vault`)에 두고 대소문자 무시 포함 여부로 표시. 아이디를 모르면 그 줄을 숨긴다. 서버 판정(`CONTAINS_USER_ID`)이 최종이고 제출 버튼 조건에는 넣지 않는다. 로그인 폼은 첫 blur 후 검증(`onTouched`), 입력을 고치면 서버 오류(로그인 폼 알림·현재/새 비밀번호 오류)를 지운다. 쓰이지 않던 `authApi.logout`(`/v1/auth/logout`, 계약에 없음) 삭제 | `features/auth/model/password-rules.ts` |
| 2026-11-22 | 로그인 화면을 벗어나 진행한 인증 흐름(2단계 인증, 로그인 전 임시비밀번호·만료 비밀번호 변경)이 성공 없이 끝나 로그인 화면으로 돌아오면 아이디·비밀번호를 모두 초기화한다. 방식은 `LoginForm`을 `key`(`auth-flow-store` `abandonedCount`, 비밀번호 변경은 `abandon()`)로 다시 마운트(네이티브 ref 호출 없음: Android `clear()`가 시트에 가려진 입력란에서 거부되던 문제 회피). `NativeFieldBase`의 `useNativeState` 값 소유·`clear()` 대체는 되돌림(입력란은 비제어). 도움말 시트는 값 유지, 비밀번호 오류는 기존대로 비밀번호만 지움. **같은 달 "인증이 성공 없이 끝나면 비밀번호만 비운다"를 대체** | `docs/architecture/login-ui.md` |
| 2026-11-22 | (1) 폼 시트 내용이 펼친 iPhone Duo에서 한쪽으로 쏠림: `SheetFormScreen`이 창 기준 좌우 safe area(`useSafeAreaInsets`)를 창 가운데 떠 있는 시트 안쪽 여백으로 넣고 있었다. 네이티브 `SafeAreaView edges={['left','right']}`(시트 실제 프레임 기준)로 교체. `FormColumn`/`FormFooter`는 최대 폭 층과 패딩 층을 나눠(`ContentColumn`) Android에서도 528(여백 포함)로 맞추고, Android 폭은 창 폭 대신 `width(CONTENT_MAX_WIDTH)`(Compose 제약으로 부모 폭에 맞춰짐). (2) 필드 검증 오류는 제출 때만: 모든 RHF 폼 `mode: 'onSubmit'` + `reValidateMode: 'onChange'`(위 행의 `onTouched` 대체). (3) 연타 방지 일원화: 네트워크는 `useRunOnce`, 사용자 탭 이동은 `navigateOnce`(600ms 앱 전체 잠금) | `.claude/rules/data-fetching.md`, `shared/lib/navigation-lock.ts` |
| 2026-11-22 | 넓은 창의 폼 시트 폭: iOS는 네이티브 page sheet 그대로, Android는 M3 바텀 시트 관례대로 창 폭 > 640dp면 640dp(`SHEET_MAX_WIDTH`, M3 `SheetMaxWidth`) 가운데 카드. react-native-screens 4.30.1 Android 시트는 최대 폭/가운데 옵션이 없어(네이티브 패치·의존성 추가 대신) 네이티브 시트를 투명·`sheetElevation: 0`으로 두고 내용의 `SheetSurface`가 카드를 그림(제스처·키보드·뒤로가기·스크림은 네이티브 그대로, 카드 양옆 탭으로 닫기). 폰은 불변. 함께: Android `NativeFormScroll` 스크롤에 `fillMaxWidth()`(폭 미지정 universal `ScrollView`가 내용 폭으로 줄어 본문이 왼쪽, 푸터는 가운데로 어긋나던 문제) | `.claude/rules/adaptive-layout.md`, `shared/ui/sheet-surface.tsx` |
