use axum::{
    body::Body,
    extract::{Path as AxumPath},
    http::{header, HeaderMap, Method, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use percent_encoding::percent_decode_str;
use tokio::io::{AsyncReadExt, AsyncSeekExt};
use tokio_util::io::ReaderStream;
use mime_guess::from_path;

fn get_mime_type(path: &str) -> String {
    from_path(path).first_or_octet_stream().to_string()
}

fn add_cors_headers(builder: axum::http::response::Builder) -> axum::http::response::Builder {
    builder
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS")
        .header(
            "Access-Control-Allow-Headers",
            "Range, Content-Type, Authorization",
        )
        .header(
            "Access-Control-Expose-Headers",
            "Content-Length, Content-Range, Accept-Ranges",
        )
}

fn cors_error_response(status: StatusCode, message: String) -> Response {
    add_cors_headers(axum::http::Response::builder())
        .status(status)
        .header(header::CONTENT_TYPE, "text/plain")
        .body(Body::from(message))
        .unwrap()
}

fn parse_range(range_str: &str, file_size: u64) -> Option<(u64, u64)> {
    let range = range_str.strip_prefix("bytes=")?;
    let parts: Vec<&str> = range.split('-').collect();
    if parts.len() != 2 {
        return None;
    }

    let (start, end) = match (parts[0].is_empty(), parts[1].is_empty()) {
        (false, false) => {
            let start: u64 = parts[0].parse().ok()?;
            let end: u64 = parts[1].parse().ok()?;
            (start, end)
        }
        (false, true) => {
            let start: u64 = parts[0].parse().ok()?;
            (start, file_size.saturating_sub(1))
        }
        (true, false) => {
            let end: u64 = parts[1].parse().ok()?;
            if end >= file_size {
                (0, file_size.saturating_sub(1))
            } else {
                (
                    file_size.saturating_sub(end).saturating_sub(1),
                    file_size.saturating_sub(1),
                )
            }
        }
        (true, true) => (0, file_size.saturating_sub(1)),
    };

    if start > end || start >= file_size {
        return None;
    }

    Some((start, end.min(file_size - 1)))
}

async fn serve_file(
    AxumPath(path): AxumPath<String>,
    headers: HeaderMap,
    method: Method,
) -> Response {
    if method == Method::OPTIONS {
        return add_cors_headers(axum::http::Response::builder())
            .status(StatusCode::OK)
            .body(Body::empty())
            .unwrap();
    }

    let path = match percent_decode_str(&path).decode_utf8() {
        Ok(p) => p.to_string(),
        Err(_) => {
            return cors_error_response(StatusCode::BAD_REQUEST, "Invalid URL encoding".to_string());
        }
    };

    let path = if path.starts_with('/') {
        path
    } else {
        format!("/{}", path)
    };
    let mime_type = get_mime_type(&path);

    match tokio::fs::File::open(&path).await {
        Ok(mut file) => {
            let metadata = match file.metadata().await {
                Ok(m) => m,
                Err(e) => {
                    return cors_error_response(
                        StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Failed to get file metadata: {}", e),
                    );
                }
            };

            let file_size = metadata.len();
            let range = headers.get("range");

            if let Some(range_header) = range {
                if let Ok(range_str) = range_header.to_str() {
                    if let Some((start, end)) = parse_range(range_str, file_size) {
                        let content_length = end - start + 1;

                        if file.seek(std::io::SeekFrom::Start(start)).await.is_err() {
                            return cors_error_response(
                                StatusCode::INTERNAL_SERVER_ERROR,
                                "Failed to seek file".to_string(),
                            );
                        }

                        let reader = tokio::io::BufReader::new(file);
                        let stream = ReaderStream::with_capacity(reader.take(content_length), 8192);
                        
                        let body = Body::from_stream(stream);
                        let response = add_cors_headers(axum::http::Response::builder())
                            .status(StatusCode::PARTIAL_CONTENT)
                            .header(header::CONTENT_TYPE, mime_type)
                            .header(header::CONTENT_LENGTH, content_length.to_string())
                            .header(
                                header::CONTENT_RANGE,
                                format!("bytes {}-{}/{}", start, end, file_size),
                            )
                            .header(header::ACCEPT_RANGES, "bytes")
                            .body(body)
                            .unwrap();

                        return response;
                    } else {
                        return cors_error_response(
                            StatusCode::RANGE_NOT_SATISFIABLE,
                            format!("Range Not Satisfiable: {}", range_str),
                        );
                    }
                }
            }

            let builder = add_cors_headers(axum::http::Response::builder())
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, mime_type)
                .header(header::CONTENT_LENGTH, file_size.to_string())
                .header(header::ACCEPT_RANGES, "bytes");

            let stream = ReaderStream::with_capacity(tokio::io::BufReader::new(file), 8192);
            let body = Body::from_stream(stream);

            let response = builder.body(body).unwrap();

            response
        }
        Err(e) => cors_error_response(
            StatusCode::NOT_FOUND,
            format!("File not found: {} - {}", path, e),
        ),
    }
}

pub fn router() -> Router {
    Router::new()
        .route("/:path", get(serve_file).head(serve_file))
}
