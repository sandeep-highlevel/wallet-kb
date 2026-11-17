#!/usr/bin/env bash
# Pull the latest Wallet KB data and logic from platform-devtools-frontend.
# Components under src/kb/components are styled for this site and are NOT overwritten;
# diff them by hand when the devtools versions change.
set -euo pipefail
SRC="${DEVTOOLS_DIR:-../platform-devtools-frontend}/src/pages/billing/wallet-kb"
[ -d "$SRC" ] || { echo "Wallet KB source not found at $SRC (set DEVTOOLS_DIR)" >&2; exit 1; }
rsync -a --delete "$SRC/data/" src/kb/data/
for f in drawio.ts flowDiagram.ts kbControls.ts kbData.ts kbLinks.ts kbSdk.ts kbSearch.ts types.ts; do
  cp "$SRC/$f" "src/kb/$f"
done
echo "Synced data and logic from $SRC. Review: git diff --stat"
