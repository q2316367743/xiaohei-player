use crate::server;

#[tauri::command]
pub fn get_server_port() -> u16 {
    server::get_server_port()
}

pub async fn start_server() -> Result<u16, Box<dyn std::error::Error + Send + Sync>> {
    server::start_server().await
}
