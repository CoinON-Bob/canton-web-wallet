#!/usr/bin/env bash
# Auto backup: add all changes, commit with timestamp, push to origin main.
set -e
cd "$(dirname "$0")/.."

git add .
if git diff --staged --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "auto backup: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main
