#!/usr/bin/env bash
# PreToolUse (Bash): block the hook-skipping flag on commit and push. Exit 2 = block.
# The command word must start a command (line start or after ; & | ( ) so prose that merely mentions it is not blocked.
set -euo pipefail

COMMAND=$(jq -r '.tool_input.command // empty' <<<"$(cat)")

if grep -qE '(^|[;&|(])[[:space:]]*git[[:space:]]+(commit|push)[[:space:]][^;&|]*--no-verify' <<<"$COMMAND"; then
  echo "Blocked: the hook-skipping flag bypasses the project's checks. Fix the failing check instead." >&2
  exit 2
fi
exit 0
