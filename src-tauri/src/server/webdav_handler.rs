use axum::{
    body::Body,
    extract::{Path as AxumPath, Query},
    http::{HeaderMap, Method, StatusCode},
    response::Response,
    routing::get,
    Router,
};
use serde::Deserialize;

use super::common::{add_cors_headers, cors_error_response, cors_options_response};

#[derive(Debug, Deserialize)]
struct WebDavQuery {
    url: String,
    username: Option<String>,
    password: Option<String>,
    #[serde(default)]
    r#type: AuthType,
}

#[derive(Debug, Deserialize, Clone, Copy)]
#[serde(rename_all = "lowercase")]
enum AuthType {
    Auto,
    Digest,
    None,
    Password,
    Token,
}

impl Default for AuthType {
    fn default() -> Self {
        AuthType::Auto
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

async fn serve_webdav(
    AxumPath(_filename): AxumPath<String>,
    Query(query): Query<WebDavQuery>,
    headers: HeaderMap,
    method: Method,
) -> Response {
    if method == Method::OPTIONS {
        return cors_options_response();
    }

    let url = query.url.clone();
    let url = url.trim_end_matches(',').to_string();
    let auth_type = query.r#type;

    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0")
        .build()
        .unwrap();
    let mut request_builder = client.get(&url);

    match auth_type {
        AuthType::Password | AuthType::Auto => {
            if let (Some(username), Some(password)) = (&query.username, &query.password) {
                let credentials = format!("{}:{}", username, password);
                let encoded = base64_encode(credentials.as_bytes());
                let auth_value = format!("Basic {}", encoded);
                request_builder = request_builder.header("Authorization", auth_value);
            }
        }
        AuthType::Token => {
            if let Some(token) = &query.password {
                request_builder = request_builder.header("Authorization", format!("Bearer {}", token));
            }
        }
        AuthType::Digest => {
            if let (Some(username), Some(password)) = (&query.username, &query.password) {
                request_builder = request_builder.basic_auth(username, Some(password));
            }
        }
        AuthType::None => {}
    }

    for (key, value) in headers.iter() {
        let key_str = key.as_str();
        if key_str == "range" 
            || key_str == "authorization" 
            || key_str == "host"
            || key_str == "content-length"
            || key_str == "transfer-encoding"
        {
            continue;
        }
        if let Ok(v) = value.to_str() {
            request_builder = request_builder.header(key_str, v);
        }
    }

    let request = match request_builder.build() {
        Ok(r) => r,
        Err(e) => {
            log::error!("WebDAV failed to build request: {}", e);
            return cors_error_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to build request: {}", e),
            );
        }
    };

    match client.execute(request).await {
        Ok(response) => {
            let status_num = response.status().as_u16();
            let status = if let Ok(s) = StatusCode::from_u16(status_num) {
                s
            } else {
                StatusCode::INTERNAL_SERVER_ERROR
            };
            let mut builder = axum::http::Response::builder().status(status);

            for (key, value) in response.headers().iter() {
                if let Ok(v) = value.to_str() {
                    builder = builder.header(key.as_str(), v);
                }
            }

            let stream = response.bytes_stream();
            let body = Body::from_stream(stream);

            builder = add_cors_headers(builder);

            builder.body(body).unwrap()
        }
        Err(e) => {
            log::error!("WebDAV request failed: {}", e);
            cors_error_response(
                StatusCode::BAD_GATEWAY,
                format!("Failed to fetch WebDAV: {}", e),
            )
        }
    }
}

pub fn router() -> Router {
    Router::new()
        .route("/*filename", get(serve_webdav))
}
