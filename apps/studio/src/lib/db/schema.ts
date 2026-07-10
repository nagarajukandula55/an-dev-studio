// ============================================================================
// AN Dev Studio — SQLite schema (single migration, as a TS constant)
//
// A plain string rather than a loose .sql asset file so it survives being
// imported from anywhere (Next.js server bundle, a plain Node script, or
// vitest) without needing a bundler-specific asset loader or __dirname-based
// path resolution across those different runtimes.
//
// Every statement is idempotent (CREATE TABLE/INDEX IF NOT EXISTS) so this
// can run on every server start rather than needing a migration runner with
// versioned steps. Add new tables/columns here; for a genuinely breaking
// change to an existing column, add a new migration constant instead of
// editing this one in place once it's shipped.
// ============================================================================

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS projects (
    project_id    TEXT PRIMARY KEY,
    target_folder TEXT NOT NULL,
    platform      TEXT NOT NULL,
    prompt        TEXT NOT NULL,
    auto_approve  INTEGER NOT NULL DEFAULT 0,
    created_at    INTEGER NOT NULL,
    updated_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS approvals (
    id            TEXT PRIMARY KEY,
    project_id    TEXT NOT NULL,
    agent_path    TEXT NOT NULL,
    action_json   TEXT NOT NULL,
    status        TEXT NOT NULL,
    created_at    INTEGER NOT NULL,
    resolved_at   INTEGER,
    error         TEXT,
    output        TEXT
);
CREATE INDEX IF NOT EXISTS idx_approvals_project_id ON approvals (project_id);
CREATE INDEX IF NOT EXISTS idx_approvals_created_at ON approvals (created_at);

CREATE TABLE IF NOT EXISTS activity_log (
    id        TEXT PRIMARY KEY,
    message   TEXT NOT NULL,
    time      TEXT NOT NULL,
    agent     TEXT NOT NULL,
    status    TEXT NOT NULL,
    category  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activity_log_time ON activity_log (time);

CREATE TABLE IF NOT EXISTS agent_runs (
    id           TEXT PRIMARY KEY,
    project_id   TEXT NOT NULL,
    rationale    TEXT,
    results_json TEXT NOT NULL,
    success      INTEGER NOT NULL,
    created_at   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_agent_runs_project_id ON agent_runs (project_id);

CREATE TABLE IF NOT EXISTS verify_iterations (
    id                    TEXT PRIMARY KEY,
    project_id            TEXT NOT NULL,
    iteration             INTEGER NOT NULL,
    commands_json         TEXT NOT NULL,
    fixer_diagnosis       TEXT,
    fix_request_ids_json  TEXT,
    created_at            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_verify_iterations_project_id ON verify_iterations (project_id);
`;
