use axum::{
    body::Body,
    extract::{Path as AxumPath, Query},
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use m3u8_rs::Playlist;
use percent_encoding::{percent_decode_str, utf8_percent_encode, NON_ALPHANUMERIC};
use serde::Deserialize;
use std::collections::HashMap;
use url::Url;

#[derive(Debug, Deserialize)]
struct ProxyQuery {
    #[serde(flatten)]
    headers: HashMap<String, String>,
}

fn is_m3u8_content(content_type: Option<&str>, url: &str) -> bool {
    if let Some(ct) = content_type {
        if ct.contains("application/vnd.apple.mpegurl") || ct.contains("application/x-mpegurl") {
            return true;
        }
    }
    url.to_lowercase().ends_with(".m3u8")
}

fn rewrite_m3u8_uri(uri: &str, original_url: &str, server_port: u16) -> String {
    if uri.starts_with("http://") || uri.starts_with("https://") {
        let encoded = utf8_percent_encode(uri, NON_ALPHANUMERIC).to_string();
        format!("http://127.0.0.1:{}/proxy/{}", server_port, encoded)
    } else {
        match Url::parse(original_url) {
            Ok(base_url) => {
                if let Ok(joined_url) = base_url.join(uri) {
                    let encoded = utf8_percent_encode(joined_url.as_str(), NON_ALPHANUMERIC).to_string();
                    format!("http://127.0.0.1:{}/proxy/{}", server_port, encoded)
                } else {
                    uri.to_string()
                }
            }
            Err(_) => uri.to_string(),
        }
    }
}

fn process_m3u8_content(content: &[u8], original_url: &str, server_port: u16) -> Vec<u8> {
    match m3u8_rs::parse_playlist(content) {
        Ok((_, playlist)) => {
            match playlist {
                Playlist::MasterPlaylist(mut master) => {
                    for variant in &mut master.variants {
                        variant.uri = rewrite_m3u8_uri(&variant.uri, original_url, server_port);
                    }
                    for alternative in &mut master.alternatives {
                        alternative.uri = Some(rewrite_m3u8_uri(
                            alternative.uri.as_deref().unwrap_or(""),
                            original_url,
                            server_port,
                        ));
                    }
                    let mut result = Vec::new();
                    master.write_to(&mut result).ok();
                    result
                }
                Playlist::MediaPlaylist(mut media) => {
                    for segment in &mut media.segments {
                        segment.uri = rewrite_m3u8_uri(&segment.uri, original_url, server_port);
                        if let Some(key) = &mut segment.key {
                            key.uri = Some(rewrite_m3u8_uri(
                                key.uri.as_deref().unwrap_or(""),
                                original_url,
                                server_port,
                            ));
                        }
                        if let Some(map) = &mut segment.map {
                            map.uri = rewrite_m3u8_uri(&map.uri, original_url, server_port);
                        }
                    }
                    let mut result = Vec::new();
                    media.write_to(&mut result).ok();
                    result
                }
            }
        }
        Err(_) => content.to_vec(),
    }
}

async fn serve_proxy(
    AxumPath(url): AxumPath<String>,
    Query(query): Query<ProxyQuery>,
    headers: HeaderMap,
) -> Response {
    let server_port = super::get_server_port();
    let decoded_url = percent_decode_str(&url).decode_utf8_lossy().to_string();
    let client = reqwest::Client::new();
    let mut request_builder = client.request(reqwest::Method::GET, &decoded_url);

    for (key, value) in query.headers {
        if key.to_lowercase() == "host" || key.to_lowercase() == "content-length" {
            continue;
        }
        request_builder = request_builder.header(&key, &value);
    }

    for (key, value) in headers.iter() {
        if key.as_str() == "host" || key.as_str() == "content-length" {
            continue;
        }
        if let Ok(v) = value.to_str() {
            request_builder = request_builder.header(key.as_str(), v);
        }
    }

    match request_builder.send().await {
        Ok(response) => {
            let status_num = response.status().as_u16();
            let status = if let Ok(s) = StatusCode::from_u16(status_num) {
                s
            } else {
                StatusCode::INTERNAL_SERVER_ERROR
            };

            let content_type = response
                .headers()
                .get("content-type")
                .and_then(|v| v.to_str().ok());

            let is_m3u8 = is_m3u8_content(content_type, &decoded_url);

            if is_m3u8 {
                let response_headers = response.headers().clone();
                match response.bytes().await {
                    Ok(body_bytes) => {
                        let processed = process_m3u8_content(&body_bytes, &decoded_url, server_port);
                        
                        let mut builder = axum::http::Response::builder().status(status);
                        
                        for (key, value) in response_headers.iter() {
                            let key_str = key.as_str();
                            if key_str == "content-length" 
                                || key_str.starts_with("access-control-") {
                                continue;
                            }
                            if let Ok(v) = value.to_str() {
                                builder = builder.header(key_str, v);
                            }
                        }

                        builder = builder
                            .header("Access-Control-Allow-Origin", "*")
                            .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS")
                            .header(
                                "Access-Control-Allow-Headers",
                                "Range, Content-Type, Authorization",
                            )
                            .header(
                                "Access-Control-Expose-Headers",
                                "Content-Length, Content-Range, Accept-Ranges",
                            );

                        builder.body(Body::from(processed)).unwrap()
                    }
                    Err(e) => (
                        StatusCode::BAD_GATEWAY,
                        format!("Failed to read m3u8 content: {}", e),
                    )
                        .into_response(),
                }
            } else {
                let mut builder = axum::http::Response::builder().status(status);

                for (key, value) in response.headers().iter() {
                    let key_str = key.as_str();
                    if key_str.starts_with("access-control-") {
                        continue;
                    }
                    if let Ok(v) = value.to_str() {
                        builder = builder.header(key_str, v);
                    }
                }

                let stream = response.bytes_stream();
                let body = Body::from_stream(stream);

                builder = builder
                    .header("Access-Control-Allow-Origin", "*")
                    .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS")
                    .header(
                        "Access-Control-Allow-Headers",
                        "Range, Content-Type, Authorization",
                    )
                    .header(
                        "Access-Control-Expose-Headers",
                        "Content-Length, Content-Range, Accept-Ranges",
                    );

                builder.body(body).unwrap()
            }
        }
        Err(e) => (
            StatusCode::BAD_GATEWAY,
            format!("Failed to proxy request: {}", e),
        )
            .into_response(),
    }
}

pub fn router() -> Router {
    Router::new()
        .route("/*url", get(serve_proxy))
}
