// ============================================================================
// AN Dev Studio — SQLite connection
//
// Single shared better-sqlite3 connection, WAL mode, schema applied on first
// use. Path resolution:
//   1. AN_DEV_STUDIO_DATA_DIR env var, if set — explicit override, always wins.
//   2. When packaged as a Tauri desktop app, the OS-standard app-data
//      directory for this app's identifier (matches src-tauri/tauri.conf.json).
//      "Packaged" is detected via AN_DEV_STUDIO_PACKAGED=1 (set by the
//      desktop launcher) since the Next.js server process doesn't have
//      direct access to Tauri's JS path APIs.
//   3. Otherwise (plain `npm run dev`/`next start`), ./data/studio.db
//      relative to the process cwd.
// ============================================================================

import Database from "better-sqlite3";
import fs from "fs";
import os from "os";
import path from "path";
import { SCHEMA_SQL } from "./schema";

const APP_IDENTIFIER = "com.angroups.andevstudio";

function resolveDataDir(): string {
    if (process.env.AN_DEV_STUDIO_DATA_DIR?.trim()) {
        return process.env.AN_DEV_STUDIO_DATA_DIR.trim();
    }

    const isPackaged = process.env.AN_DEV_STUDIO_PACKAGED === "1";
    if (!isPackaged) {
        return path.join(process.cwd(), "data");
    }

    switch (process.platform) {
        case "win32":
            return path.join(process.env.APPDATA ?? os.homedir(), APP_IDENTIFIER);
        case "darwin":
            return path.join(os.homedir(), "Library", "Application Support", APP_IDENTIFIER);
        default:
            return path.join(os.homedir(), ".local", "share", APP_IDENTIFIER);
    }
}

function openDatabase(): Database.Database {
    const dataDir = resolveDataDir();
    fs.mkdirSync(dataDir, { recursive: true });

    const db = new Database(path.join(dataDir, "studio.db"));
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.exec(SCHEMA_SQL);

    return db;
}

declare global {
    // eslint-disable-next-line no-var
    var __anDevStudioDb: Database.Database | undefined;
}

export const db: Database.Database = globalThis.__anDevStudioDb ?? (globalThis.__anDevStudioDb = openDatabase());
