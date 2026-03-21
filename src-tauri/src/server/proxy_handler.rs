use axum::{
    body::Body,
    extract::{Path as AxumPath, Query},
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use serde::Deserialize;
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
struct ProxyQuery {
    #[serde(flatten)]
    headers: HashMap<String, String>,
}

async fn serve_proxy(
    AxumPath(url): AxumPath<String>,
    Query(query): Query<ProxyQuery>,
    headers: HeaderMap,
) -> Response {
    let client = reqwest::Client::new();
    let mut request_builder = client.request(reqwest::Method::GET, &url);

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
            let mut builder = axum::http::Response::builder().status(status);

            for (key, value) in response.headers().iter() {
                if let Ok(v) = value.to_str() {
                    builder = builder.header(key.as_str(), v);
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
