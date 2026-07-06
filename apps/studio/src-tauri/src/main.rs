// ============================================================================
// AN Dev Studio — desktop shell
//
// On launch, shows a small "launcher" window (plain HTML wizard, no Next.js
// needed) that: asks for an install path on first run only, then on every
// run fetches the latest commit from the repo, runs npm install, and builds
// — all with live progress and failure suggestions in the wizard UI, no
// terminal or manual command needed. Once the build succeeds and the
// Next.js server answers on localhost, a second "app" window opens pointed
// at it and the launcher window closes.
// ============================================================================

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod setup;

use std::net::TcpStream;
use std::process::{Child, Command};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_dialog::DialogExt;

const PORT: u16 = 3210;

struct ServerProcess(Mutex<Option<Child>>);
struct LauncherReady(AtomicBool);

fn spawn_server(project_root: &std::path::Path) -> std::io::Result<Child> {
    let studio_dir = project_root.join("apps").join("studio");

    #[cfg(target_os = "windows")]
    let child = Command::new("cmd")
        .current_dir(&studio_dir)
        .args(["/C", "npm", "run", "start", "--", "-p", &PORT.to_string()])
        .spawn();

    #[cfg(not(target_os = "windows"))]
    let child = Command::new("sh")
        .current_dir(&studio_dir)
        .arg("-c")
        .arg(format!("npm run start -- -p {PORT}"))
        .spawn();

    child
}

fn wait_for_server(timeout: Duration) -> bool {
    let start = std::time::Instant::now();
    while start.elapsed() < timeout {
        if TcpStream::connect(("127.0.0.1", PORT)).is_ok() {
            return true;
        }
        std::thread::sleep(Duration::from_millis(300));
    }
    false
}

/// Opens the real app window pointed at the running Next.js server, then
/// closes the launcher window. Runs on a background thread since it blocks
/// waiting for the server to respond.
fn open_app_window(app: AppHandle, project_root: std::path::PathBuf) {
    std::thread::spawn(move || {
        let child = match spawn_server(&project_root) {
            Ok(c) => c,
            Err(e) => {
                let _ = app.emit(
                    "setup-progress",
                    setup::ProgressPayload {
                        step: "build".to_string(),
                        state: "error".to_string(),
                        message: Some(format!("Failed to start the app server: {e}")),
                        detail: Some(
                            "The build succeeded but the app server could not be started. \
                             Try launching again; if this keeps happening, restart your machine \
                             to clear anything holding port 3210."
                                .to_string(),
                        ),
                    },
                );
                return;
            }
        };

        app.manage(ServerProcess(Mutex::new(Some(child))));

        let ready = wait_for_server(Duration::from_secs(90));
        if !ready {
            let _ = app.emit(
                "setup-progress",
                setup::ProgressPayload {
                    step: "build".to_string(),
                    state: "error".to_string(),
                    message: Some(format!(
                        "The app server did not respond on port {PORT} within 90 seconds."
                    )),
                    detail: Some(
                        "The build finished but the app didn't start in time. This can happen on a slow \
                         first start. Try clicking Launch again."
                            .to_string(),
                    ),
                },
            );
            return;
        }

        let app_url = format!("http://127.0.0.1:{PORT}");
        let build_result = WebviewWindowBuilder::new(
            &app,
            "main",
            WebviewUrl::External(app_url.parse().expect("invalid app URL")),
        )
        .title("AN Dev Studio")
        .inner_size(1440.0, 900.0)
        .min_inner_size(960.0, 640.0)
        .resizable(true)
        .build();

        match build_result {
            Ok(_) => {
                if let Some(launcher) = app.get_webview_window("launcher") {
                    let _ = launcher.close();
                }
            }
            Err(e) => {
                eprintln!("Failed to open main app window: {e}");
            }
        }
    });
}

#[tauri::command]
fn launcher_ready(app: AppHandle, ready_flag: tauri::State<LauncherReady>) {
    // Idempotent — the launcher page's script may signal ready more than
    // once (e.g. a dev-mode reload); avoid kicking off the pipeline twice.
    if ready_flag.0.swap(true, Ordering::SeqCst) {
        return;
    }

    match setup::load_config(&app) {
        Some(cfg) => {
            let app_for_thread = app.clone();
            std::thread::spawn(move || {
                setup::run_pipeline(&app_for_thread, &cfg.install_path, None);
            });
        }
        None => {
            let _ = app.emit("setup-need-path", ());
        }
    }
}

#[tauri::command]
fn pick_install_folder(app: AppHandle) -> Option<String> {
    app.dialog()
        .file()
        .blocking_pick_folder()
        .map(|p| p.to_string())
}

#[tauri::command]
fn start_setup(app: AppHandle, install_path: String) {
    let cfg = setup::LauncherConfig {
        install_path: install_path.clone(),
    };
    if let Err(e) = setup::save_config(&app, &cfg) {
        eprintln!("Failed to save launcher config: {e}");
    }
    std::thread::spawn(move || {
        setup::run_pipeline(&app, &install_path, None);
    });
}

#[tauri::command]
fn retry_setup_step(app: AppHandle, step: Option<String>) {
    let cfg = match setup::load_config(&app) {
        Some(c) => c,
        None => return,
    };
    std::thread::spawn(move || {
        setup::run_pipeline(&app, &cfg.install_path, step.as_deref());
    });
}

#[tauri::command]
fn launch_app(app: AppHandle) -> Result<(), String> {
    let cfg = setup::load_config(&app).ok_or("No install path configured yet")?;
    let project_root = std::path::PathBuf::from(cfg.install_path);
    open_app_window(app, project_root);
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(LauncherReady(AtomicBool::new(false)))
        .invoke_handler(tauri::generate_handler![
            launcher_ready,
            pick_install_folder,
            start_setup,
            retry_setup_step,
            launch_app,
        ])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                if window.label() == "main" {
                    if let Some(state) = window.app_handle().try_state::<ServerProcess>() {
                        if let Ok(mut guard) = state.0.lock() {
                            if let Some(mut child) = guard.take() {
                                let _ = child.kill();
                            }
                        }
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running AN Dev Studio");
}
