#!/usr/bin/env bash
# ==============================================================================
# flows.sh / nirjhor.flow - Sync & Management Script
# ==============================================================================
set -e

# Change to the project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Ensure mise node environment is loaded if available
if command -v mise >/dev/null 2>&1; then
  eval "$(mise env bash 2>/dev/null || true)"
fi

# Color codes for pretty terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

show_help() {
  echo -e "${CYAN}nirjhor.flow / flows.sh - Helper CLI${NC}"
  echo ""
  echo "Usage:"
  echo -e "  ${GREEN}./sync.sh${NC} [options | message]"
  echo ""
  echo "Commands / Options:"
  echo -e "  ${GREEN}./sync.sh${NC}                    Sync notes to GitHub Pages (auto commit & push)"
  echo -e "  ${GREEN}./sync.sh \"your message\"${NC}      Sync notes with a custom commit message"
  echo -e "  ${GREEN}./sync.sh --preview | dev${NC}     Start local preview server (http://localhost:8080)"
  echo -e "  ${GREEN}./sync.sh --build${NC}             Build static site without serving"
  echo -e "  ${GREEN}./sync.sh --obsidian${NC}          Open this vault in Obsidian"
  echo -e "  ${GREEN}./sync.sh --help${NC}              Show this help message"
  echo ""
}

case "$1" in
  --help|-h)
    show_help
    exit 0
    ;;
  --preview|dev|serve|-s)
    echo -e "${BLUE}==> Starting Quartz live preview server...${NC}"
    echo -e "${CYAN}Preview will be available at: http://localhost:8080${NC}"
    npx quartz build --serve
    ;;
  --build|-b)
    echo -e "${BLUE}==> Building Quartz site...${NC}"
    npx quartz build
    echo -e "${GREEN}✓ Build completed successfully!${NC}"
    ;;
  --obsidian|-o)
    echo -e "${BLUE}==> Launching Obsidian...${NC}"
    obsidian "obsidian://open?vault=flows.sh" 2>/dev/null || obsidian "$SCRIPT_DIR/flows.sh" &
    ;;
  *)
    COMMIT_MSG="$*"
    echo -e "${BLUE}==> Verifying site build...${NC}"
    npx quartz build

    echo -e "${BLUE}==> Syncing vault to GitHub...${NC}"
    if [ -n "$COMMIT_MSG" ]; then
      npx quartz sync --message "$COMMIT_MSG"
    else
      npx quartz sync
    fi
    echo -e "${GREEN}✓ All synced and pushed to your site!${NC}"
    ;;
esac
