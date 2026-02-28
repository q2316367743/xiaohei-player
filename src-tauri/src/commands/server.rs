use axum::{
    body::Body,
    extract::Query,
    http::{header, HeaderMap, StatusCode},
    response::IntoResponse,
    routing::get,
    Router,
};
use serde::Deserialize;
use std::net::SocketAddr;
use std::sync::Arc;
use std::sync::atomic::{AtomicU16, Ordering};
use tokio::io::{AsyncReadExt, AsyncSeekExt};

static SERVER_PORT: AtomicU16 = AtomicU16::new(0);

#[derive(Clone)]
struct AppState;

#[derive(Debug, Deserialize)]
struct FileQuery {
    path: String,
}

#[derive(Debug, Deserialize)]
struct WebDavQuery {
    url: String,
    username: Option<String>,
    password: Option<String>,
}

async fn serve_file(Query(query): Query<FileQuery>, headers: HeaderMap) -> impl IntoResponse {
    let path = query.path.clone();
    
    match tokio::fs::File::open(&path).await {
        Ok(mut file) => {
            let metadata = match file.metadata().await {
                Ok(m) => m,
                Err(e) => {
                    return Err((
                        StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Failed to get file metadata: {}", e),
                    ));
                }
            };
            
            let file_size = metadata.len();
            let range = headers.get("range");
            
            if let Some(range_header) = range {
                if let Ok(range_str) = range_header.to_str() {
                    if let Some((start, end)) = parse_range(range_str, file_size) {
                        let file_size_range = (end - start + 1) as usize;
                        
                        if file.seek(std::io::SeekFrom::Start(start)).await.is_err() {
                            return Err((
                                StatusCode::INTERNAL_SERVER_ERROR,
                                "Failed to seek file".to_string(),
                            ));
                        }
                        
                        let mut buffer = vec![0u8; file_size_range];
                        match file.read_exact(&mut buffer).await {
                            Ok(_) => {}
                            Err(e) if e.kind() == std::io::ErrorKind::UnexpectedEof => {}
                            Err(e) => {
                                return Err((
                                    StatusCode::INTERNAL_SERVER_ERROR,
                                    format!("Failed to read file: {}", e),
                                ));
                            }
                        }
                        
                        let response = axum::http::Response::builder()
                            .status(StatusCode::PARTIAL_CONTENT)
                            .header(header::CONTENT_TYPE, "application/octet-stream")
                            .header(header::CONTENT_LENGTH, file_size_range.to_string())
                            .header(header::CONTENT_RANGE, format!("bytes {}-{}/{}", start, end, file_size))
                            .header(header::ACCEPT_RANGES, "bytes")
                            .header("Access-Control-Allow-Origin", "*")
                            .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                            .header("Access-Control-Allow-Headers", "Range, Content-Type, Authorization")
                            .body(Body::from(buffer))
                            .unwrap();
                        
                        return Ok(response);
                    }
                }
            }
            
            let mut buffer = Vec::new();
            if let Err(e) = file.read_to_end(&mut buffer).await {
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Failed to read file: {}", e),
                ));
            }
            
            let response = axum::http::Response::builder()
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, "application/octet-stream")
                .header(header::CONTENT_LENGTH, buffer.len().to_string())
                .header(header::ACCEPT_RANGES, "bytes")
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                .header("Access-Control-Allow-Headers", "Range, Content-Type, Authorization")
                .body(Body::from(buffer))
                .unwrap();
            
            Ok(response)
        }
        Err(e) => {
            Err((
                StatusCode::NOT_FOUND,
                format!("File not found: {} - {}", path, e),
            ))
        }
    }
}

fn parse_range(range_str: &str, file_size: u64) -> Option<(u64, u64)> {
    let range = range_str.strip_prefix("bytes=")?;
    let parts: Vec<&str> = range.split('-').collect();
    if parts.len() != 2 {
        return None;
    }
    
    let start = if parts[0].is_empty() {
        if parts[1].is_empty() {
            return None;
        }
        let end: u64 = parts[1].parse().ok()?;
        file_size.saturating_sub(end).saturating_sub(1)
    } else {
        parts[0].parse().ok()?
    };
    
    let end = if parts[1].is_empty() {
        file_size - 1
    } else {
        parts[1].parse().ok()?
    };
    
    if start > end || start >= file_size {
        return None;
    }
    
    Some((start, end.min(file_size - 1)))
}

async fn serve_webdav(Query(query): Query<WebDavQuery>, headers: HeaderMap) -> impl IntoResponse {
    let url = query.url.clone();
    
    let client = reqwest::Client::new();
    
    let mut request_builder = client.request(
        reqwest::Method::GET,
        &url,
    );
    
    if let (Some(username), Some(password)) = (&query.username, &query.password) {
        let credentials = format!("{}:{}", username, password);
        let encoded = base64_encode(credentials.as_bytes());
        request_builder = request_builder.header("Authorization", format!("Basic {}", encoded));
    }
    
    for (key, value) in headers.iter() {
        if key.as_str() == "range" || key.as_str() == "authorization" {
            continue;
        }
        if let Ok(v) = value.to_str() {
            request_builder = request_builder.header(key.as_str(), v);
        }
    }
    
    match request_builder.send().await {
        Ok(response) => {
            let status_num = response.status().as_u16();
            let status = if let Ok(s) = StatusCode::from_u16(status_num) { s } else { StatusCode::INTERNAL_SERVER_ERROR };
            let mut builder = axum::http::Response::builder().status(status);
            
            for (key, value) in response.headers().iter() {
                if let Ok(v) = value.to_str() {
                    builder = builder.header(key.as_str(), v);
                }
            }
            
            let bytes = response.bytes().await.unwrap_or_default();
            
            Ok(builder
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                .header("Access-Control-Allow-Headers", "Range, Content-Type, Authorization")
                .body(Body::from(bytes)).unwrap())
        }
        Err(e) => {
            Err((
                StatusCode::BAD_GATEWAY,
                format!("Failed to fetch WebDAV: {}", e),
            ))
        }
    }
}

fn base64_encode(data: &[u8]) -> String {
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut result = String::new();
    
    for chunk in data.chunks(3) {
        let b0 = chunk[0] as usize;
        let b1 = chunk.get(1).copied().unwrap_or(0) as usize;
        let b2 = chunk.get(2).copied().unwrap_or(0) as usize;
        
        result.push(CHARSET[b0 >> 2] as char);
        result.push(CHARSET[((b0 & 0x03) << 4) | (b1 >> 4)] as char);
        
        if chunk.len() > 1 {
            result.push(CHARSET[((b1 & 0x0f) << 2) | (b2 >> 6)] as char);
        } else {
            result.push('=');
        }
        
        if chunk.len() > 2 {
            result.push(CHARSET[b2 & 0x3f] as char);
        } else {
            result.push('=');
        }
    }
    
    result
}

#[tauri::command]
pub fn get_server_port() -> u16 {
    SERVER_PORT.load(Ordering::SeqCst)
}

pub async fn start_server() -> Result<u16, Box<dyn std::error::Error + Send + Sync>> {
    let app = Router::new()
        .route("/file", get(serve_file))
        .route("/webdav", get(serve_webdav))
        .with_state(Arc::new(AppState));
    
    let addr = SocketAddr::from(([127, 0, 0, 1], 0));
    
    let listener = tokio::net::TcpListener::bind(addr).await?;
    let port = listener.local_addr()?.port();
    
    SERVER_PORT.store(port, Ordering::SeqCst);
    
    log::info!("HTTP file server started on port {}", port);
    
    axum::serve(listener, app).await?;
    
    Ok(port)
}
