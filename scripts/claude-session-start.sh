#!/usr/bin/env bash
# Claude Code SessionStart hook (OPS-7, tech-stack.md §10): installs dependencies in
# cloud sessions so lint/tests run immediately. No-op locally and without package.json.
set -uo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/..}" || exit 0
[ -f package.json ] || exit 0

if ! command -v pnpm >/dev/null 2>&1 || ! pnpm --version >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || true
fi

if pnpm install --frozen-lockfile >/tmp/claude-session-pnpm-install.log 2>&1; then
  echo "pnpm install: OK"
else
  echo "pnpm install failed – see /tmp/claude-session-pnpm-install.log" >&2
fi
exit 0
