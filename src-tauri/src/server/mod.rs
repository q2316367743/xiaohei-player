mod common;
mod file_handler;
mod webdav_handler;
mod proxy_handler;
mod smb_handler;

use axum::{
    extract::Request,
    http::StatusCode,
    response::IntoResponse,
    Router,
};
use std::net::SocketAddr;
use std::sync::atomic::{AtomicU16, Ordering};
use tokio::net::TcpListener;
use tower_http::trace::TraceLayer;

static SERVER_PORT: AtomicU16 = AtomicU16::new(0);

pub fn get_server_port() -> u16 {
    SERVER_PORT.load(Ordering::SeqCst)
}

async fn fallback_handler(request: Request) -> impl IntoResponse {
    log::error!("[server] Fallback handler called for unmatched route: {:?}", request.uri());
    (StatusCode::NOT_FOUND, "Not Found")
}

pub async fn start_server() -> Result<u16, Box<dyn std::error::Error + Send + Sync>> {
    let app = Router::new()
        .nest("/file", file_handler::router())
        .nest("/webdav", webdav_handler::router())
        .nest("/proxy", proxy_handler::router())
        .nest("/smb", smb_handler::router())
        .fallback(fallback_handler)
        .layer(TraceLayer::new_for_http());

    let addr = SocketAddr::from(([127, 0, 0, 1], 0));

    let listener = TcpListener::bind(addr).await?;
    let port = listener.local_addr()?.port();

    SERVER_PORT.store(port, Ordering::SeqCst);

    log::info!("[server] Starting HTTP server on port {}", port);

    axum::serve(listener, app).await?;

    Ok(port)
}
