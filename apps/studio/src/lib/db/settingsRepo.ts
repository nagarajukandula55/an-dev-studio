// ============================================================================
// AN Dev Studio — Settings repository (SQLite-backed)
//
// Generic key-value store for small pieces of app-wide state that aren't
// per-project — currently just the license state (lib/licensing/LicenseManager.ts).
// ============================================================================

import { db } from "./connection";

export function getSetting(key: string): string | undefined {
    const row = db.prepare(`SELECT value FROM settings WHERE key = ?`).get(key) as { value: string } | undefined;
    return row?.value;
}

export function setSetting(key: string, value: string): void {
    db.prepare(
        `INSERT INTO settings (key, value, updated_at) VALUES (@key, @value, @now)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    ).run({ key, value, now: Date.now() });
}

export function deleteSetting(key: string): void {
    db.prepare(`DELETE FROM settings WHERE key = ?`).run(key);
}
