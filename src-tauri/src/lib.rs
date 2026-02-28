// use tauri::{
//     menu::{Menu, MenuItem},
//     tray::TrayIconBuilder,
//     Manager,
// };
use tauri_plugin_log::{Target, TargetKind};

mod commands;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::LogDir { file_name: None }),
                    Target::new(TargetKind::Webview),
                ])
                .level(log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::ffmpeg::ffmpeg_command,
            commands::server::get_server_port
        ])
        .setup(|app| {
            std::thread::spawn(|| {
                let rt = tokio::runtime::Runtime::new().unwrap();
                rt.block_on(async {
                    let _ = commands::server::start_server().await;
                });
            });
            
            // 注册更新插件
            #[cfg(desktop)]
            let _ = app.handle().plugin(tauri_plugin_updater::Builder::new().build());

//             let show_i = MenuItem::with_id(app, "show", "显示", true, None::<&str>)?;
//             let quit_i = MenuItem::with_id(app, "quit", "关闭", true, None::<&str>)?;
//             let menu = Menu::with_items(app, &[&show_i, &quit_i])?;
//
//             TrayIconBuilder::new()
//                 .icon(app.default_window_icon().unwrap().clone())
//                 .menu(&menu)
//                 .show_menu_on_left_click(true)
//                 .on_menu_event(|app: &tauri::AppHandle, event| match event.id.as_ref() {
//                     "show" => {
//                         app.get_webview_window("main").unwrap().show().unwrap();
//                     }
//                     "quit" => {
//                         app.exit(0);
//                     }
//                     _ => {
//                         println!("menu item {:?} not handled", event.id);
//                     }
//                 })
//                 .build(app)?;

//             global_mouse::start_global_mouse_listener(app.handle().clone());
//
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
