// ============================================================================
// AN Dev Studio — Build variant
//
// Two variants from one codebase, controlled by env vars (no code fork):
//
// - Personal build (default): ANU_ENABLED unset/true. Includes the ANu
//   provider and the ANu Guide widget — kept for personal use only, never
//   distributed to customers.
// - Sellable build: ANU_ENABLED=false. Excludes the ANu provider entirely
//   (buyers bring their own cloud provider key, or their own local Ollama
//   under whatever name they configure) and hides the ANu Guide widget.
//   The assistant's display name becomes configurable per install via
//   AGENT_DISPLAY_NAME (see lib/configStore.ts) instead of hardcoded "ANu".
// ============================================================================

export const ANU_ENABLED = process.env.ANU_ENABLED !== "false";
