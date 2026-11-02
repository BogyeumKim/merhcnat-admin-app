#!/usr/bin/env bash
# PostToolUse (Write|Edit): run `eslint --fix` on the edited file and report what is left. Exit 2 shows stderr to Claude.
set -uo pipefail

FILE_PATH=$(jq -r '.tool_input.file_path // empty' <<<"$(cat)")
[[ "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]] || exit 0
[[ "$FILE_PATH" == *"/node_modules/"* ]] && exit 0
[ -f "$FILE_PATH" ] || exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ -x node_modules/.bin/eslint ] || exit 0

OUTPUT=$(node_modules/.bin/eslint --fix "$FILE_PATH" 2>&1)
if [ $? -ne 0 ]; then
  printf 'ESLint problems remain in %s:\n%s\n' "$FILE_PATH" "$OUTPUT" >&2
  exit 2
fi
exit 0
