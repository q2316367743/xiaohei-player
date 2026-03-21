use axum::{
    body::Body,
    http::{header, StatusCode},
    response::Response,
};

pub fn get_mime_type(path: &str) -> String {
    mime_guess::from_path(path)
        .first_or_octet_stream()
        .to_string()
}

pub fn add_cors_headers(builder: axum::http::response::Builder) -> axum::http::response::Builder {
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

pub fn cors_error_response(status: StatusCode, message: String) -> Response {
    add_cors_headers(axum::http::Response::builder())
        .status(status)
        .header(header::CONTENT_TYPE, "text/plain")
        .body(Body::from(message))
        .unwrap()
}

pub fn cors_options_response() -> Response {
    add_cors_headers(axum::http::Response::builder())
        .status(StatusCode::OK)
        .body(Body::empty())
        .unwrap()
}

pub fn parse_range(range_str: &str, file_size: u64) -> Option<(u64, u64)> {
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
