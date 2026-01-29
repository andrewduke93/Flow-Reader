#!/usr/bin/env bash
# Small helper to publish ./dist to gh-pages using a PAT (for maintainers).
# Usage:
#   export PAGES_PAT="ghp_xxx" && ./scripts/deploy-pages-with-pat.sh

set -euo pipefail
if [ -z "${PAGES_PAT:-}" ]; then
  echo "Error: PAGES_PAT is not set. Create a Personal Access Token and export it as PAGES_PAT." >&2
  exit 1
fi
if [ ! -d dist ]; then
  echo "Error: ./dist not found — run 'npm run build' first." >&2
  exit 1
fi
TMPDIR=$(mktemp -d)
cp -a dist/. "$TMPDIR"
pushd "$TMPDIR" >/dev/null
git init -q
git checkout -b gh-pages || git checkout --orphan gh-pages
git remote add origin "https://x-access-token:${PAGES_PAT}@github.com/$(git config --get remote.origin.url | sed -e 's|https://github.com/||' -e 's|git@github.com:||')" || true
git add -A
git -c user.name="flow-ci" -c user.email="flow-ci@users.noreply.github.com" commit -m "chore: publish dist $(date -u +%Y-%m-%dT%H:%M:%SZ)" || true
# Force push to ensure publish branch matches
git push --force origin gh-pages
popd >/dev/null
rm -rf "$TMPDIR"
echo "Published ./dist to gh-pages (via PAGES_PAT)"