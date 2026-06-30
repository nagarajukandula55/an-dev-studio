/**
 * ============================================================================
 * AN Dev Studio — Vitest Configuration
 * ============================================================================
 */

import { defineConfig } from "vitest/config";
import { resolve }      from "node:path";

export default defineConfig({
    test: {
        globals:     true,
        environment: "node",
        include:     ["src/**/*.test.ts", "packages/**/*.test.ts"],
        exclude:     ["**/node_modules/**", "**/dist/**", "**/.next/**"],
        coverage: {
            provider:  "v8",
            reporter:  ["text", "json", "html"],
            include:   ["src/**/*.ts", "packages/**/src/**/*.ts"],
            exclude:   ["**/*.test.ts", "**/index.ts", "**/types/**"],
            thresholds: {
                lines:     80,
                functions: 80,
                branches:  75,
                statements: 80,
            },
        },
        reporters: ["verbose"],
    },
    resolve: {
        alias: {
            "@an-groups/config":  resolve(__dirname, "packages/config/src"),
            "@an-groups/shared":  resolve(__dirname, "packages/shared/src"),
            "@an-groups/ai-core": resolve(__dirname, "packages/ai-core/src"),
            "@an-groups/ui":      resolve(__dirname, "packages/ui/src"),
        },
    },
});
