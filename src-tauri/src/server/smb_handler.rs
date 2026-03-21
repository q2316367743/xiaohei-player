use axum::{
    body::Body,
    extract::{Path as AxumPath, Query},
    http::{header, HeaderMap, Method, StatusCode},
    response::Response,
    routing::get,
    Router,
};
use percent_encoding::percent_decode_str;
use serde::Deserialize;
use smb::{FileCreateArgs, GetLen, UncPath};
use smb_fscc::FileAccessMask;
use std::str::FromStr;

use crate::smb::client::get_client;
use super::common::{add_cors_headers, cors_error_response, cors_options_response, get_mime_type, parse_range};

#[derive(Debug, Deserialize)]
struct SmbQuery {
    client_id: String,
    url: String,
}

async fn serve_smb(
    AxumPath(filename): AxumPath<String>,
    Query(query): Query<SmbQuery>,
    headers: HeaderMap,
    method: Method,
) -> Response {
    if method == Method::OPTIONS {
        return cors_options_response();
    }

    let client = match get_client(&query.client_id) {
        Ok(c) => c,
        Err(e) => {
            return cors_error_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to get SMB client: {}", e),
            );
        }
    };

    let url = match percent_decode_str(&query.url).decode_utf8() {
        Ok(u) => u.to_string(),
        Err(_) => {
            return cors_error_response(StatusCode::BAD_REQUEST, "Invalid URL encoding".to_string());
        }
    };

    let unc_path = match UncPath::from_str(&url) {
        Ok(p) => p,
        Err(e) => {
            return cors_error_response(
                StatusCode::BAD_REQUEST,
                format!("Invalid UNC path: {:?}", e),
            );
        }
    };

    let file = match client
        .create_file(
            &unc_path,
            &FileCreateArgs::make_open_existing(
                FileAccessMask::new()
                    .with_generic_read(true)
                    .with_synchronize(true),
            ),
        )
        .await
    {
        Ok(f) => match f {
            smb::Resource::File(f) => f,
            _ => {
                return cors_error_response(
                    StatusCode::BAD_REQUEST,
                    "Path is not a file".to_string(),
                );
            }
        },
        Err(e) => {
            return cors_error_response(
                StatusCode::NOT_FOUND,
                format!("Failed to open file: {:?}", e),
            );
        }
    };

    let file_size = match file.get_len().await {
        Ok(size) => size,
        Err(e) => {
            return cors_error_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to get file size: {:?}", e),
            );
        }
    };

    let mime_type = get_mime_type(&filename);
    let range = headers.get("range");

    if let Some(range_header) = range {
        if let Ok(range_str) = range_header.to_str() {
            if let Some((start, end)) = parse_range(range_str, file_size) {
                let content_length = end - start + 1;

                let mut buffer = vec![0u8; content_length as usize];
                match file.read_block(&mut buffer, start, None, false).await {
                    Ok(bytes_read) => {
                        buffer.truncate(bytes_read);
                        
                        let response = add_cors_headers(axum::http::Response::builder())
                            .status(StatusCode::PARTIAL_CONTENT)
                            .header(header::CONTENT_TYPE, mime_type)
                            .header(header::CONTENT_LENGTH, bytes_read.to_string())
                            .header(
                                header::CONTENT_RANGE,
                                format!("bytes {}-{}/{}", start, start + bytes_read as u64 - 1, file_size),
                            )
                            .header(header::ACCEPT_RANGES, "bytes")
                            .body(Body::from(buffer))
                            .unwrap();

                        return response;
                    }
                    Err(e) => {
                        return cors_error_response(
                            StatusCode::INTERNAL_SERVER_ERROR,
                            format!("Failed to read file: {}", e),
                        );
                    }
                }
            } else {
                return cors_error_response(
                    StatusCode::RANGE_NOT_SATISFIABLE,
                    format!("Range Not Satisfiable: {}", range_str),
                );
            }
        }
    }

    let mut buffer = vec![0u8; file_size as usize];
    match file.read_block(&mut buffer, 0, None, false).await {
        Ok(bytes_read) => {
            buffer.truncate(bytes_read);
            
            let response = add_cors_headers(axum::http::Response::builder())
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, mime_type)
                .header(header::CONTENT_LENGTH, bytes_read.to_string())
                .header(header::ACCEPT_RANGES, "bytes")
                .body(Body::from(buffer))
                .unwrap();

            response
        }
        Err(e) => cors_error_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to read file: {}", e),
        ),
    }
}

pub fn router() -> Router {
    Router::new()
        .route("/:filename", get(serve_smb).head(serve_smb))
}
