#!/usr/bin/env bash
# PostToolUse (Write|Edit): 폴더블(iPhone Duo, Galaxy Fold)·태블릿·리사이즈 창에서 깨지는 레이아웃 패턴을 막는다.
# 규칙: .claude/rules/adaptive-layout.md. 위반이 있으면 exit 2로 Claude에게 보여 고치게 한다.
set -uo pipefail

FILE_PATH=$(jq -r '.tool_input.file_path // empty' <<<"$(cat)")
[[ "$FILE_PATH" == */src/*.tsx ]] || exit 0   # UI 파일만 (데이터 .ts의 이미지 픽셀 크기 등은 레이아웃이 아니다)
[[ "$FILE_PATH" == *"/node_modules/"* ]] && exit 0
[ -f "$FILE_PATH" ] || exit 0

# 레이아웃 기준을 정의하는 파일 자체는 검사하지 않는다.
case "$FILE_PATH" in
  */src/shared/theme/layout.ts|*/src/shared/ui/content-width*) exit 0 ;;
esac

PROBLEMS=""
add() { PROBLEMS+="  - $1"$'\n'; }
hits() { grep -nE "$1" "$FILE_PATH" | grep -vE '^\s*[0-9]+:\s*(//|\*)' | head -3 | sed 's/^/      /'; }

if grep -qE 'Dimensions\.get\(' "$FILE_PATH"; then
  add "Dimensions.get() 금지: 창 크기가 바뀌어도(접기/펼치기, iOS 27 리사이즈) 갱신되지 않는다. useWindowLayout()/useWindowDimensions()를 쓴다."$'\n'"$(hits 'Dimensions\.get\(')"
fi
if grep -qE '(deviceType|DeviceType\.|modelName|isTablet|isFold|isDuo|isIPad)' "$FILE_PATH"; then
  add "기기 종류/모델로 레이아웃을 나누지 않는다. 창 크기(useWindowLayout의 widthClass/isWide/isShort)로만 분기한다."$'\n'"$(hits '(deviceType|DeviceType\.|modelName|isTablet|isFold|isDuo|isIPad)')"
fi
if grep -qE '(^|[^a-zA-Z])width:\s*[3-9][0-9]{2}([^0-9]|$)|(^|[^a-zA-Z])width:\s*[0-9]{4}' "$FILE_PATH"; then
  add "300dp 이상 고정 width 금지: 좁은 창(320dp)과 접힌 화면에서 잘린다. width: '100%' + 최대 폭(CONTENT_MAX_WIDTH, FormColumn/useContentWidthModifiers)을 쓴다."$'\n'"$(hits '(^|[^a-zA-Z])width:\s*([3-9][0-9]{2}|[0-9]{4})')"
fi
if [[ "$FILE_PATH" == */screens/* ]] && grep -qE "import \{[^}]*\bScrollView\b[^}]*\} from '@expo/ui'" "$FILE_PATH"; then
  add "화면에서 universal ScrollView 직접 사용 금지: 넓은 창에서 내용이 한쪽으로 쏠린다. NativeFormScroll(→ FormColumn 가운데 정렬) 기반 BrandedFormScreen/SheetFormScreen/TabScreen을 쓴다."
fi

if [ -n "$PROBLEMS" ]; then
  printf '폴더블/넓은 창 레이아웃 규칙 위반 (%s):\n%s규칙: .claude/rules/adaptive-layout.md\n' "$FILE_PATH" "$PROBLEMS" >&2
  exit 2
fi

# 새 화면/시트를 만들거나 고칠 때마다 넓은 창 확인을 상기시킨다(차단하지 않음).
if [[ "$FILE_PATH" == */screens/*.tsx ]]; then
  jq -n --arg f "$FILE_PATH" '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:("화면 파일 수정됨(" + $f + "): .claude/rules/adaptive-layout.md 체크리스트(펼친 iPhone Duo/Galaxy Fold 가운데 정렬, 폼 시트 쏠림, 창 컨트롤 겹침, 320dp, 가로, 큰 글꼴)로 확인하고 확인 못 한 항목은 보고한다.")}}'
fi
exit 0
