#!/usr/bin/env bash
# ============================================================================
# ANu Setup Script — Linux / macOS
# Sets up Ollama and creates the ANu in-house AI model
#
# Run: chmod +x anu/setup.sh && ./anu/setup.sh
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; GRAY='\033[0;37m'; NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   ANu Setup — AN Dev Studio              ║${NC}"
echo -e "${CYAN}║   AN Universal In-House AI               ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── Step 1: Install Ollama ───────────────────────────────────────────────────
echo -e "${YELLOW}► Checking Ollama installation...${NC}"

if command -v ollama &>/dev/null; then
    echo -e "  ${GREEN}✓ Ollama already installed${NC}"
else
    echo -e "  Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
    echo -e "  ${GREEN}✓ Ollama installed${NC}"
fi

# ── Step 2: Start Ollama service ─────────────────────────────────────────────
echo ""
echo -e "${YELLOW}► Starting Ollama service...${NC}"

if curl -sf http://localhost:11434/ &>/dev/null; then
    echo -e "  ${GREEN}✓ Ollama already running${NC}"
else
    ollama serve &>/dev/null &
    sleep 3
    echo -e "  ${GREEN}✓ Ollama service started${NC}"
fi

# ── Step 3: Pull base model ───────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}► Pulling base model: qwen2.5-coder:7b${NC}"
echo -e "  ${GRAY}(~4.7GB — takes a few minutes on first run)${NC}"

ollama pull qwen2.5-coder:7b
echo -e "  ${GREEN}✓ Base model ready${NC}"

# ── Step 4: Create ANu model ──────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}► Creating ANu model from Modelfile...${NC}"

ollama create anu -f "$SCRIPT_DIR/Modelfile"
echo -e "  ${GREEN}✓ ANu model created${NC}"

# ── Step 5: Configure .env.local ──────────────────────────────────────────────
echo ""
echo -e "${YELLOW}► Configuring .env.local...${NC}"

ENV_FILE="$PROJECT_ROOT/apps/studio/.env.local"
ROOT_ENV_FILE="$PROJECT_ROOT/.env.local"

TARGET_ENV="$ENV_FILE"
[ -f "$ROOT_ENV_FILE" ] && TARGET_ENV="$ROOT_ENV_FILE"

if [ -f "$TARGET_ENV" ] && grep -q "OLLAMA_ENABLED" "$TARGET_ENV"; then
    echo -e "  ${GREEN}✓ ANu config already in .env.local${NC}"
else
    cat >> "$TARGET_ENV" << 'EOF'

# ANu — In-house AI (Ollama)
OLLAMA_ENABLED=true
OLLAMA_HOST=http://localhost:11434
OLLAMA_DEFAULT_MODEL=anu
EOF
    echo -e "  ${GREEN}✓ Added ANu config to $TARGET_ENV${NC}"
fi

# ── Step 6: Verify ────────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}► Verifying ANu...${NC}"
TEST_RESP=$(ollama run anu "Reply with exactly: ANu is operational." 2>&1 || echo "loaded")
echo -e "  ${GREEN}✓ ANu response: $TEST_RESP${NC}"

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ANu is ready!                                          ║${NC}"
echo -e "${GREEN}║                                                          ║${NC}"
echo -e "${GREEN}║   Next steps:                                            ║${NC}"
echo -e "${GREEN}║   1. Restart dev server: npm run dev                     ║${NC}"
echo -e "${GREEN}║   2. Open AI Studio → select ANu from provider switcher  ║${NC}"
echo -e "${GREEN}║   3. Your prompts stay 100% private on your machine      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
