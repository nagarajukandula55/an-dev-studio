// Runs once per test file (each in its own worker/module registry), before
// any test code imports the db connection — gives every test file its own
// isolated SQLite dir so parallel test files never contend for the same
// database file (which produced "database is locked" / SQLITE_BUSY when a
// single shared dir was set at the vitest.config.ts module-load level).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.AN_DEV_STUDIO_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "an-dev-studio-test-db-"));
