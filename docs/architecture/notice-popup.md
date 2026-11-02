# 로그인 후 공지 팝업

## 요구사항
로그인 후 공지가 있으면 띄운다. 재접속해도 다시 보이고, "닫기"와 "오늘 하루 보지 않기"가 있으며, 후자를 누르면 그날은 재접속해도 안 뜬다. 내용은 서버에서 받고 이미지가 있을 수 있다.

## 모달 vs 바텀시트 (결정: 바텀시트)
조사(요즘IT 사례 정리 등)에서 확인된 것: 앱 팝업은 정중앙 팝업이 아직 더 흔하지만 모바일에서는 바텀시트가 늘고 있고, 정보 전달용 팝업에는 바텀시트가 관행에 가깝다. 이미지 공지에 대한 직접적인 UX 기준은 찾지 못했다. 이 프로젝트에서는 인증 단계가 이미 form sheet 라우트(`verify`)라서 같은 방식(`presentation: 'formSheet'` 라우트 `notice-popup`)을 쓴다. 이미지 + 본문 + 버튼 두 개를 담기에 높이가 넉넉하고, 아래로 끌어 닫는 제스처와 접근성이 OS 기본이다. store에 모달을 넣는 방식(zustand + 호스트)은 확인창처럼 어디서든 명령형으로 부르는 다이얼로그에 맞고, 화면 전환 성격의 이 팝업은 라우트가 표준이다.

## 구조 (`features/notices`)
- `api/notice-api.ts` 서버 호출 + zod 검증(`model/schemas.ts`). 개발용 fixture는 `EXPO_PUBLIC_NOTICE_MOCK=1`(`__DEV__`에서만, 릴리스 번들에서 제거).
- `queries/use-popup-notices-data.ts` TanStack Query. 실패해도 오류 화면 없이 팝업만 건너뛴다.
- `model/use-notice-popup-launcher.ts` 로그인 영역(`(tabs)/_layout`)에서 한 번 호출. 아직 안 보여준 공지를 하나씩 `notice-popup` 시트로 연다(이전 시트가 닫히면 다음). "닫기"는 이번 로그인 동안만 건너뛰므로(ref가 로그인 영역과 함께 사라짐) 다음 로그인에 다시 뜬다.
- `model/hidden-today.ts` "오늘 하루 보지 않기": `{ date, ids }`를 `shared/lib/storage`에 저장. 기기의 로컬 날짜가 바뀌면 비워진다. 공지 id만 저장(개인정보 없음).
- `components/notice-image.tsx` `expo-image`: 서버가 준 width/height로 높이를 먼저 잡아 레이아웃이 튀지 않고, 디스크 캐시, 로드 실패하면 이미지를 숨긴다. 원격 이미지는 이 컴포넌트로만 보여준다.
- `screens/notice-popup-screen.tsx` 이미지(RN) + 네이티브 본문/버튼(`@expo/ui`).

## 보안/품질 결정
- 본문은 일반 텍스트만 렌더한다. HTML/마크다운을 렌더하지 않아 공지 내용이 앱에 코드를 주입할 수 없다.
- 이미지 URL은 https만 허용(스키마 검증 실패 시 응답 전체를 거부).
- 이미지는 서버/CDN에 두고 앱은 URL만 받는다(앱 번들 크기와 무관, 앱 재배포 없이 교체).
- 서버 계약 초안: `docs/backend-contract/notice-popup.md`(미합의).
- 확인하지 못한 것: Android 시트 동작, 실제 서버 응답(아직 없음). iOS 시뮬레이터에서 이미지 공지 → "오늘 하루 보지 않기" → 다음 공지 → 닫기 → 홈 흐름을 fixture로 확인했다.
