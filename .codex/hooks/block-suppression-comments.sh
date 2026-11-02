#!/usr/bin/env bash
# PreToolUse (Write|Edit): block lint/type suppression comments in code files. Exit 2 = block.
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(jq -r '.tool_input.file_path // empty' <<<"$INPUT")

# Only code files; docs may mention these patterns.
[[ "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]] || exit 0

CONTENT=$(jq -r '(.tool_input.content // "") + (.tool_input.new_string // "")' <<<"$INPUT")
[ -n "$CONTENT" ] || exit 0

VIOLATIONS=""
grep -qE '(//|/\*)\s*eslint-disable' <<<"$CONTENT" && VIOLATIONS+=$'\n- eslint-disable comment. Fix the code instead of suppressing the rule.'
grep -qE '(//|/\*).*@ts-ignore' <<<"$CONTENT" && VIOLATIONS+=$'\n- @ts-ignore. Use proper types or type narrowing.'
grep -qE '(//|/\*).*@ts-nocheck' <<<"$CONTENT" && VIOLATIONS+=$'\n- @ts-nocheck. Every file must be type-checked.'
grep -qE '@ts-expect-error\s*(\*/)?\s*$' <<<"$CONTENT" && VIOLATIONS+=$'\n- @ts-expect-error without a description.'

if [ -n "$VIOLATIONS" ]; then
  printf 'Blocked: suppression comments are not allowed in %s:%s\n' "$FILE_PATH" "$VIOLATIONS" >&2
  exit 2
fi
exit 0
