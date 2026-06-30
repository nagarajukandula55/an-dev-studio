/**
 * ============================================================================
 * @an-groups/ui
 * Shared UI component library for AN Dev Studio
 * ============================================================================
 *
 * NOTE: Components in this package are designed to be consumed by the
 * apps/studio Next.js application. They rely on the CSS custom properties
 * defined in apps/studio/src/app/globals.css.
 *
 * This package re-exports all shared UI primitives so downstream apps
 * only need one import path.
 * ============================================================================
 */

// Re-export tokens for design-system consumers
export const DESIGN_TOKENS = {
    // Spacing scale (px)
    space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 },
    // Border radii
    radius: { sm: "6px", md: "8px", lg: "12px", xl: "16px", full: "9999px" },
    // Font sizes (px)
    text: { xs: 11, sm: 12.5, base: 13.5, md: 14, lg: 16, xl: 20, "2xl": 24 },
    // Font weights
    weight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
    // Transition speeds
    transition: { fast: "0.12s ease", base: "0.2s ease", slow: "0.35s ease" },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;

// Color palette constants (semantic names only; actual values from CSS vars)
export const COLOR_VARS = {
    bg:          "var(--color-bg)",
    bgSurface:   "var(--color-bg-surface)",
    bgSubtle:    "var(--color-bg-subtle)",
    border:      "var(--color-border)",
    text:        "var(--color-text)",
    textMuted:   "var(--color-text-muted)",
    accent:      "var(--color-accent)",
    accentHover: "var(--color-accent-hover)",
} as const;

export type ColorVar = keyof typeof COLOR_VARS;
