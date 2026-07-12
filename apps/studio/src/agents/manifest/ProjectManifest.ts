// ============================================================================
// AN Dev Studio — Project Manifest
//
// Every core-team agent call includes a ProjectManifest so outputs cohere:
// instead of each agent hallucinating file paths/imports in isolation, they
// all see the same view of "what exists in this project right now" — a file
// tree plus the full contents of the files most relevant to the current
// task, with everything else summarized as a tree entry to keep the prompt
// within a token budget.
// ============================================================================

import fs from "fs";
import path from "path";

const IGNORED_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", "out", "coverage", ".turbo"]);

// Rough token estimate — no tokenizer dependency, ~4 chars/token is close
// enough for budgeting which files to include in full vs. summarize.
const CHARS_PER_TOKEN = 4;
const DEFAULT_TOKEN_BUDGET = 6000;

export interface ManifestFile {
    relativePath: string;
    content: string;
}

export interface ProjectManifest {
    /** Indented directory tree of every file under the project root. */
    tree: string;
    /** Full contents of the files prioritized for this task, within budget. */
    files: ManifestFile[];
    /** Human-readable note on what was included vs. summarized, for the prompt. */
    summary: string;
}

export interface BuildManifestOptions {
    /** Relative paths (or substrings) the current task touches — prioritized for full inclusion. */
    focusPaths?: string[];
    /** Token budget for full file contents (tree is always included in full). */
    tokenBudget?: number;
}

/**
 * Walks targetFolder and builds a ProjectManifest: the whole tree (cheap,
 * always useful for import-path coherence) plus full contents of the files
 * most relevant to the task, capped by tokenBudget. Safe to call on a
 * not-yet-created folder (returns an empty manifest) — new projects start
 * with nothing to show.
 */
export function buildProjectManifest(targetFolder: string, opts: BuildManifestOptions = {}): ProjectManifest {
    const tokenBudget = opts.tokenBudget ?? DEFAULT_TOKEN_BUDGET;
    const charBudget = tokenBudget * CHARS_PER_TOKEN;

    const allFiles = listFiles(targetFolder);
    if (allFiles.length === 0) {
        return {
            tree: "(empty — no files yet)",
            files: [],
            summary: "Project folder is empty or does not exist yet; this is a fresh build.",
        };
    }

    const tree = renderTree(allFiles);
    const prioritized = prioritize(allFiles, opts.focusPaths ?? []);

    const included: ManifestFile[] = [];
    let usedChars = 0;
    let skippedCount = 0;

    for (const relativePath of prioritized) {
        const absolutePath = path.join(targetFolder, relativePath);
        let content: string;
        try {
            content = fs.readFileSync(absolutePath, "utf-8");
        } catch {
            continue; // unreadable (binary, permissions, race with a concurrent write) — skip, not fatal
        }

        if (usedChars + content.length > charBudget) {
            skippedCount++;
            continue;
        }

        included.push({ relativePath, content });
        usedChars += content.length;
    }

    const summary =
        `${included.length}/${allFiles.length} file(s) included in full` +
        (skippedCount > 0 ? `; ${skippedCount} omitted for budget (see tree for their paths).` : ".");

    return { tree, files: included, summary };
}

/** Renders the manifest as a single string block ready to drop into an LLM prompt. */
export function renderManifestForPrompt(manifest: ProjectManifest): string {
    const fileBlocks = manifest.files
        .map((f) => `--- ${f.relativePath} ---\n${f.content}`)
        .join("\n\n");

    return (
        `Project file tree:\n${manifest.tree}\n\n` +
        `Manifest note: ${manifest.summary}\n\n` +
        (fileBlocks ? `Relevant existing file contents:\n${fileBlocks}` : "No existing file contents included.")
    );
}

function listFiles(targetFolder: string): string[] {
    if (!fs.existsSync(targetFolder)) return [];

    const results: string[] = [];
    const walk = (dir: string): void => {
        let entries: fs.Dirent[];
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
            return;
        }
        for (const entry of entries) {
            if (IGNORED_DIRS.has(entry.name)) continue;
            const absolutePath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(absolutePath);
            } else if (entry.isFile()) {
                results.push(path.relative(targetFolder, absolutePath).split(path.sep).join("/"));
            }
        }
    };
    walk(targetFolder);
    return results.sort();
}

function renderTree(relativePaths: string[]): string {
    return relativePaths.map((p) => `  ${p}`).join("\n");
}

/** Files matching a focus path (exact, prefix, or substring) come first; everything else follows in tree order. */
function prioritize(allFiles: string[], focusPaths: string[]): string[] {
    if (focusPaths.length === 0) return allFiles;

    const matches = (relativePath: string): boolean =>
        focusPaths.some((f) => relativePath === f || relativePath.startsWith(f) || relativePath.includes(f));

    const focused = allFiles.filter(matches);
    const rest = allFiles.filter((f) => !matches(f));
    return [...focused, ...rest];
}
