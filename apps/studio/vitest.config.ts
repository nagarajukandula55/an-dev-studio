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
    },
    resolve: {
        alias: {
            "@": resolve(import.meta.dirname, "src"),
        },
    },
});
