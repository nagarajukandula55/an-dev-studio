import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["src/**/*.test.ts"],
        exclude: ["**/node_modules/**", "**/.next/**"],
        css: false,
        reporters: ["verbose"],
        // Gives every test FILE its own isolated SQLite dir (see the setup
        // file) — never touches the real dev database at ./data/studio.db.
        setupFiles: ["./vitest.setup.ts"],
    },
    resolve: {
        alias: {
            "@": resolve(import.meta.dirname, "src"),
        },
    },
});
