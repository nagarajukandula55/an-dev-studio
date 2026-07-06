// ============================================================================
// AN Dev Studio — Desktop Setup/Update Runner
//
// Drives the "check for updates and rebuild" flow that runs every time the
// app launches, with no user input required once an install path has been
// chosen once. Steps: verify git is present -> clone (first run) or fetch +
// reset to latest commit (subsequent runs) -> npm install -> npm run build.
// Each step emits a "setup-progress" event so the launcher wizard UI can
// show live progress, and a failure emits enough detail for the UI to
// suggest a fix (missing git, missing Node, network failure, disk space).
// ============================================================================

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::{Command, Output};
use tauri::{AppHandle, Emitter};

pub const REPO_URL: &str = "https://github.com/nagarajukandula55/an-dev-studio.git";

#[derive(Debug, Clone, Serialize)]
pub struct ProgressPayload {
    pub step: String,
    pub state: String, // "running" | "done" | "error"
    pub message: Option<String>,
    pub detail: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LauncherConfig {
    pub install_path: String,
}

fn config_path(app: &AppHandle) -> PathBuf {
    // Stored next to the app's config dir so it survives app updates and
    // is user-specific on multi-user machines.
    use tauri::Manager;
    let dir = app
        .path()
        .app_config_dir()
        .unwrap_or_else(|_| std::env::temp_dir());
    let _ = fs::create_dir_all(&dir);
    dir.join("launcher-config.json")
}

pub fn load_config(app: &AppHandle) -> Option<LauncherConfig> {
    let path = config_path(app);
    let raw = fs::read_to_string(path).ok()?;
    serde_json::from_str(&raw).ok()
}

pub fn save_config(app: &AppHandle, cfg: &LauncherConfig) -> std::io::Result<()> {
    let path = config_path(app);
    fs::write(path, serde_json::to_string_pretty(cfg)?)
}

fn emit_progress(app: &AppHandle, step: &str, state: &str, message: Option<String>, detail: Option<String>) {
    let _ = app.emit(
        "setup-progress",
        ProgressPayload {
            step: step.to_string(),
            state: state.to_string(),
            message,
            detail,
        },
    );
}

fn command_exists(cmd: &str) -> bool {
    let finder = if cfg!(target_os = "windows") { "where" } else { "which" };
    Command::new(finder)
        .arg(cmd)
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

fn run_logged(app: &AppHandle, step: &str, program: &str, args: &[&str], cwd: &Path) -> Result<Output, String> {
    emit_progress(
        app,
        step,
        "running",
        Some(format!("$ {} {}", program, args.join(" "))),
        None,
    );

    let output = Command::new(program)
        .args(args)
        .current_dir(cwd)
        .output()
        .map_err(|e| format!("Failed to start `{program}`: {e}"))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    if !stdout.trim().is_empty() {
        emit_progress(app, step, "running", Some(stdout.trim().to_string()), None);
    }
    if !stderr.trim().is_empty() {
        emit_progress(app, step, "running", Some(stderr.trim().to_string()), None);
    }

    if !output.status.success() {
        return Err(format!(
            "`{program} {}` exited with {}\n{}",
            args.join(" "),
            output.status,
            stderr.trim()
        ));
    }

    Ok(output)
}

/// Turns a raw command failure into a specific, actionable suggestion —
/// matching the kinds of failures we actually hit by hand while building
/// this: missing git, missing Node/npm, network unreachable, disk full.
fn diagnose(step: &str, raw_error: &str) -> String {
    let lower = raw_error.to_lowercase();

    if lower.contains("not found") || lower.contains("is not recognized") {
        if step == "check-git" {
            return "Git isn't installed or isn't on PATH. Install Git for Windows from https://git-scm.com/download/win, \
                    then click Retry. If you just installed it, you may need to restart AN Dev Studio for PATH changes to take effect."
                .to_string();
        }
        if step == "install" || step == "build" {
            return "Node.js/npm isn't installed or isn't on PATH. Install Node.js LTS from https://nodejs.org, \
                    then click Retry. If you just installed it, restart AN Dev Studio so it picks up the updated PATH."
                .to_string();
        }
    }

    if lower.contains("could not resolve host")
        || lower.contains("network is unreachable")
        || lower.contains("could not connect")
        || lower.contains("timed out")
    {
        return "This looks like a network problem — the repository or npm registry couldn't be reached. \
                Check your internet connection and firewall/proxy settings, then click Retry."
            .to_string();
    }

    if lower.contains("no space left") || lower.contains("enospc") || lower.contains("disk full") {
        return "The install drive appears to be out of disk space. Free up space (Disk Cleanup, or remove unused \
                large folders) and click Retry."
            .to_string();
    }

    if lower.contains("permission denied") || lower.contains("access is denied") {
        return "A file couldn't be written — this usually means another program has it open, or AN Dev Studio needs \
                to be run with different permissions for this folder. Close any editors/terminals using this folder \
                and click Retry."
            .to_string();
    }

    // Fallback: show a trimmed version of the raw error rather than a generic message,
    // so there's still something actionable even for cases we haven't seen before.
    let trimmed: String = raw_error.chars().take(600).collect();
    format!("{trimmed}\n\nIf this keeps happening, copy the full log below and share it for help.")
}

/// Runs the full setup pipeline from a specific step onward (used both for a
/// fresh run and for "Retry this step", which re-runs from the failed step
/// rather than starting over from git).
pub fn run_pipeline(app: &AppHandle, install_path: &str, from_step: Option<&str>) {
    let path = Path::new(install_path);
    let steps = ["check-git", "fetch", "install", "build"];
    let start_index = from_step
        .and_then(|s| steps.iter().position(|x| *x == s))
        .unwrap_or(0);

    for &step in &steps[start_index..] {
        let result = match step {
            "check-git" => step_check_git(app),
            "fetch" => step_fetch(app, path),
            "install" => step_install(app, path),
            "build" => step_build(app, path),
            _ => Ok(()),
        };

        match result {
            Ok(()) => {
                emit_progress(app, step, "done", Some(format!("{step} complete")), None);
            }
            Err(raw_error) => {
                let detail = diagnose(step, &raw_error);
                emit_progress(app, step, "error", Some(raw_error.clone()), Some(detail));
                return; // stop the pipeline — user must retry or fix manually
            }
        }
    }

    let _ = app.emit("setup-complete", ());
}

fn step_check_git(app: &AppHandle) -> Result<(), String> {
    emit_progress(app, "check-git", "running", Some("Checking for git...".to_string()), None);
    if command_exists("git") {
        Ok(())
    } else {
        Err("git: command not found".to_string())
    }
}

fn step_fetch(app: &AppHandle, path: &Path) -> Result<(), String> {
    if !path.join(".git").is_dir() {
        // First run: clone fresh.
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        run_logged(
            app,
            "fetch",
            "git",
            &["clone", REPO_URL, path.to_str().unwrap_or(".")],
            path.parent().unwrap_or(Path::new(".")),
        )?;
        return Ok(());
    }

    // Subsequent runs: fetch latest and hard-reset to the remote's default
    // branch tip, so "start with latest commit" is literal — no merge
    // conflicts to resolve, no stale local commits to reconcile. Any local
    // uncommitted experimentation in this folder is not preserved by
    // design, since this is meant to be a "just run the latest" app copy,
    // not a working git clone the user hand-edits.
    run_logged(app, "fetch", "git", &["fetch", "origin"], path)?;
    let branch_output = run_logged(
        app,
        "fetch",
        "git",
        &["remote", "show", "origin"],
        path,
    )?;
    let stdout = String::from_utf8_lossy(&branch_output.stdout);
    let default_branch = stdout
        .lines()
        .find_map(|l| l.trim().strip_prefix("HEAD branch: "))
        .unwrap_or("main")
        .to_string();

    run_logged(
        app,
        "fetch",
        "git",
        &["reset", "--hard", &format!("origin/{default_branch}")],
        path,
    )?;
    Ok(())
}

fn step_install(app: &AppHandle, project_root: &Path) -> Result<(), String> {
    let studio_dir = project_root.join("apps").join("studio");
    if !command_exists("npm") {
        return Err("npm: command not found".to_string());
    }
    let npm_cmd = if cfg!(target_os = "windows") { "npm.cmd" } else { "npm" };
    run_logged(app, "install", npm_cmd, &["install"], &studio_dir)?;
    Ok(())
}

fn step_build(app: &AppHandle, project_root: &Path) -> Result<(), String> {
    let studio_dir = project_root.join("apps").join("studio");
    let npm_cmd = if cfg!(target_os = "windows") { "npm.cmd" } else { "npm" };
    run_logged(app, "build", npm_cmd, &["run", "build"], &studio_dir)?;
    Ok(())
}
