// AN Dev Studio — desktop shell
//
// This is a thin native window around the existing Next.js app: on launch it
// starts the Next.js server as a background process (assumes `npm install`
// and `npm run build` have already been run — the setup script handles
// that), waits until it's actually answering requests, then opens a native
// window pointed at it. Closing the window stops the server.
//
// Known simplification: this expects to run from within the project
// checkout (it starts the server via `npm run start` in the apps/studio
// directory next to src-tauri/), not as a fully self-contained installer for
// machines without Node.js. That's the right tradeoff for "run this on my
// own laptop instead of Vercel" — a fully bundled, Node-free installer is a
// bigger follow-up if you want to distribute this to other people's machines.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::net::TcpStream;
use std::path::PathBuf;
use std::process::{Child, Command};
use std::sync::Mutex;
use std::time::Duration;

const PORT: u16 = 3210;

struct ServerProcess(Mutex<Option<Child>>);

fn studio_dir() -> PathBuf {
    // src-tauri's working directory when launched via `cargo tauri dev`/`build`
    // is src-tauri/ itself; the Next.js app lives one level up.
    let mut dir = std::env::current_dir().expect("failed to read current dir");
    if dir.ends_with("src-tauri") {
        dir.pop();
    }
    dir
}

fn spawn_server() -> Child {
    let dir = studio_dir();

    #[cfg(target_os = "windows")]
    let child = Command::new("cmd")
        .current_dir(&dir)
        .args(["/C", "npm", "run", "start", "--", "-p", &PORT.to_string()])
        .spawn();

    #[cfg(not(target_os = "windows"))]
    let child = Command::new("sh")
        .current_dir(&dir)
        .arg("-c")
        .arg(format!("npm run start -- -p {PORT}"))
        .spawn();

    child.expect(
        "failed to start the Next.js server — make sure `npm install` and `npm run build` \
         have been run in apps/studio first (the setup script does this automatically)",
    )
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

fn main() {
    let child = spawn_server();
    let ready = wait_for_server(Duration::from_secs(60));
    if !ready {
        eprintln!(
            "AN Dev Studio's local server did not respond on port {PORT} within 60s. \
             Check that `npm run build` completed successfully in apps/studio."
        );
    }

    tauri::Builder::default()
        .manage(ServerProcess(Mutex::new(Some(child))))
        .on_window_event(|_window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                // best-effort cleanup handled by ServerProcess drop below
            }
        })
        .build(tauri::generate_context!())
        .expect("error while building AN Dev Studio")
        .run(|app_handle, event| {
            if let tauri::RunEvent::ExitRequested { .. } | tauri::RunEvent::Exit = event {
                if let Some(state) = app_handle.try_state::<ServerProcess>() {
                    if let Ok(mut guard) = state.0.lock() {
                        if let Some(mut child) = guard.take() {
                            let _ = child.kill();
                        }
                    }
                }
            }
        });
}
