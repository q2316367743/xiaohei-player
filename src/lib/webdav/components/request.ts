import type { AxiosResponse } from "axios";
import { instance } from "@/lib/http";
import type {
  Headers,
  RequestOptions,
  ResponseDataDetailed,
  WebDAVClientContext,
  WebDAVClientError,
  DigestContext,
} from "../types";
import { generateDigestAuthHeader, parseDigestAuthHeader } from "./auth";
import { encodePath } from "./url";

export class WebDAVRequestError  implements WebDAVClientError {
  status?: number;
  response?: AxiosResponse;
  name: string;
  stack?: string | undefined;
  message: string;

  constructor(message: string, status?: number, response?: AxiosResponse) {
    this.message = message;
    this.name = "WebDAVRequestError";
    this.status = status;
    this.response = response;
  }

}

export async function request(
  context: WebDAVClientContext,
  requestOptions: RequestOptions
): Promise<AxiosResponse> {
  const { method, headers: requestHeaders, data, signal } = requestOptions;

  const url = requestOptions.url;
  if (!url) {
    throw Error("Request URL is required");
  }

  const headers: Headers = {
    ...context.headers,
    ...requestHeaders,
  };

  if (context.authType === "digest" && context.digest) {
    const authHeader = await generateDigestAuthHeader(
      context.digest,
      method,
      url
    );
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }
  }

  const config = {
    method,
    url,
    headers,
    data,
    signal,
    responseType: "arraybuffer" as const,
    validateStatus: () => true,
  };

  const response = await instance.request(config);

  if (response.status === 401 && context.authType === "digest") {
    const authHeader = response.headers["www-authenticate"];
    if (authHeader && context.digest) {
      const digestParts = parseDigestAuthHeader(authHeader as string);
      if (digestParts && digestParts.nonce) {
        context.digest = {
          ...context.digest,
          ...digestParts,
          hasDigestAuth: true,
        } as DigestContext;

        const retryAuthHeader = await generateDigestAuthHeader(
          context.digest,
          method,
          url
        );
        if (retryAuthHeader) {
          headers["Authorization"] = retryAuthHeader;
        }

        const retryConfig = {
          method,
          url,
          headers,
          data,
          signal,
          responseType: "arraybuffer" as const,
          validateStatus: () => true,
        };

        return instance.request(retryConfig);
      }
    }
  }

  return response;
}

export async function requestWithBody<T = unknown>(
  context: WebDAVClientContext,
  requestOptions: RequestOptions
): Promise<T> {
  const response = await request(context, requestOptions);

  if (response.status < 200 || response.status >= 300) {
    throw new WebDAVRequestError(
      `Request failed with status ${response.status}`,
      response.status,
      response
    );
  }

  const contentType = response.headers["content-type"] as string;
  if (contentType?.includes("application/json")) {
    return JSON.parse(new TextDecoder().decode(response.data)) as T;
  }

  if (contentType?.includes("text/") || contentType?.includes("application/xml")) {
    return new TextDecoder().decode(response.data) as T;
  }

  return response.data as T;
}

export async function requestWithDetails<T = unknown>(
  context: WebDAVClientContext,
  requestOptions: RequestOptions
): Promise<ResponseDataDetailed<T>> {
  const response = await request(context, requestOptions);

  if (response.status < 200 || response.status >= 300) {
    throw new WebDAVRequestError(
      `Request failed with status ${response.status}`,
      response.status,
      response
    );
  }

  const responseHeaders = extractHeaders(response);
  let data: T;

  const contentType = response.headers["content-type"] as string;
  if (contentType?.includes("application/json")) {
    data = JSON.parse(new TextDecoder().decode(response.data)) as T;
  } else if (contentType?.includes("text/") || contentType?.includes("application/xml")) {
    data = new TextDecoder().decode(response.data) as T;
  } else {
    data = response.data as T;
  }

  return {
    data,
    headers: responseHeaders,
    status: response.status,
    statusText: response.statusText,
  };
}

function extractHeaders(response: AxiosResponse): Headers {
  const headers: Headers = {};
  Object.entries(response.headers).forEach(([key, value]) => {
    if (value !== undefined) {
      headers[key] = String(value);
    }
  });
  return headers;
}

export function buildRequestURL(
  context: WebDAVClientContext,
  path: string
): string {
  const encodedPath = encodePath(path);
  const baseURL = context.remoteURL.endsWith("/")
    ? context.remoteURL
    : `${context.remoteURL}/`;
  return `${baseURL}${encodedPath.startsWith("/") ? encodedPath.slice(1) : encodedPath}`;
}

export function createRequestOptions(
  method: string,
  path: string,
  context: WebDAVClientContext,
  options: Partial<RequestOptions> = {}
): RequestOptions {
  return {
    method,
    url: buildRequestURL(context, path),
    headers: {
      ...context.headers,
      ...options.headers,
    },
    data: options.data,
    signal: options.signal,
    onDownloadProgress: options.onDownloadProgress,
    onUploadProgress: options.onUploadProgress,
  };
}

export function isSuccessStatus(status: number): boolean {
  return status >= 200 && status < 300;
}

export function isRedirectStatus(status: number): boolean {
  return status >= 300 && status < 400;
}

export function isClientErrorStatus(status: number): boolean {
  return status >= 400 && status < 500;
}

export function isServerErrorStatus(status: number): boolean {
  return status >= 500 && status < 600;
}
