mod file_handler;
mod webdav_handler;
mod proxy_handler;

use axum::Router;
use std::net::SocketAddr;
use std::sync::atomic::{AtomicU16, Ordering};
use tokio::net::TcpListener;

static SERVER_PORT: AtomicU16 = AtomicU16::new(0);

pub fn get_server_port() -> u16 {
    SERVER_PORT.load(Ordering::SeqCst)
}

pub async fn start_server() -> Result<u16, Box<dyn std::error::Error + Send + Sync>> {
    let app = Router::new()
        .nest("/file", file_handler::router())
        .nest("/webdav", webdav_handler::router())
        .nest("/proxy", proxy_handler::router());

    let addr = SocketAddr::from(([127, 0, 0, 1], 0));

    let listener = TcpListener::bind(addr).await?;
    let port = listener.local_addr()?.port();

    SERVER_PORT.store(port, Ordering::SeqCst);

    log::info!("HTTP file server started on port {}", port);

    axum::serve(listener, app).await?;

    Ok(port)
}
