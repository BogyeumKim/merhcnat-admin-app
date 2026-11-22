#!/usr/bin/env bash
# PostToolUse (Write|Edit): 아이콘은 중앙 맵(`src/shared/ui/icons.ts`, feature 전용이면 `features/<f>/model/icons.ts`)에서만 정의한다.
# 컴포넌트/화면에 인라인 `{ ios, android }` 쌍, `Icon.select`, 아이콘 XML import가 있으면 exit 2로 Claude에게 보여 고치게 한다.
# 규칙: .claude/rules/expo-ui.md
set -uo pipefail

FILE_PATH=$(jq -r '.tool_input.file_path // empty' <<<"$(cat)")
[[ "$FILE_PATH" == */src/*.ts || "$FILE_PATH" == */src/*.tsx ]] || exit 0
[[ "$FILE_PATH" == *"/node_modules/"* ]] && exit 0
[ -f "$FILE_PATH" ] || exit 0

# 맵 파일 자체는 검사하지 않는다.
case "$FILE_PATH" in
  */src/shared/ui/icons.ts|*/src/shared/ui/icons/*|*/src/features/*/model/icons.ts) exit 0 ;;
esac

PROBLEMS=""
add() { PROBLEMS+="  - $1"$'\n'; }
hits() { grep -nE "$1" "$FILE_PATH" | grep -vE '^[0-9]+:\s*(//|\*)' | head -3 | sed 's/^/      /'; }

# `ios: 'sf.name'` (색처럼 문자열이 아닌 `ios: Color.ios.x`는 해당 없음)
PAIR="(\{|,)\s*ios:\s*['\"]"
if [ -n "$(hits "$PAIR")" ]; then
  add "인라인 아이콘 쌍 금지: { ios: '...', android: ... }를 쓰지 말고 icons.<이름>을 쓴다(없으면 맵에 추가)."$'\n'"$(hits "$PAIR")"
fi
SELECT='Icon\.select\('
if [ -n "$(hits "$SELECT")" ]; then
  add "Icon.select는 아이콘 맵 파일에서만 쓴다."$'\n'"$(hits "$SELECT")"
fi
XML="(from|import\(|require\()\s*['\"](@expo/material-symbols/|@/assets/icons/)[^'\"]*\.xml"
if [ -n "$(hits "$XML")" ]; then
  add "아이콘 XML은 아이콘 맵 파일에서만 import한다."$'\n'"$(hits "$XML")"
fi

if [ -n "$PROBLEMS" ]; then
  printf '아이콘 맵 규칙 위반 (%s):\n%s맵: src/shared/ui/icons.ts · 규칙: .claude/rules/expo-ui.md\n' "$FILE_PATH" "$PROBLEMS" >&2
  exit 2
fi
exit 0
