import type {
  AuthType,
  DigestContext,
  Headers,
  OAuthToken,
  WebDAVClientOptions,
} from "../types";

export function getAuthType(options: WebDAVClientOptions): AuthType {
  const { authType, username, password, token } = options;

  if (authType && authType !== "auto") {
    return authType;
  }

  if (token) {
    return "token";
  }

  if (username && password) {
    return "password";
  }

  return "none";
}

export function generateBasicAuthHeader(
  username: string,
  password: string
): string {
  const credentials = btoa(`${username}:${password}`);
  return `Basic ${credentials}`;
}

export function generateBearerAuthHeader(token: OAuthToken): string {
  return `${token.token_type || "Bearer"} ${token.access_token}`;
}

export function createDigestContext(
  username: string,
  password: string
): DigestContext {
  return {
    username,
    password,
    nc: 0,
    algorithm: "MD5",
    hasDigestAuth: false,
  };
}

export function parseDigestAuthHeader(
  header: string
): Partial<DigestContext> | null {
  const parts = header.split(",");
  const result: Partial<DigestContext> = {};

  for (const part of parts) {
    const [key, value] = part.trim().split("=");
    if (key && value) {
      const cleanValue = value.replace(/"/g, "");
      switch (key) {
        case "realm":
          result.realm = cleanValue;
          break;
        case "nonce":
          result.nonce = cleanValue;
          break;
        case "qop":
          result.qop = cleanValue;
          break;
        case "opaque":
          result.opaque = cleanValue;
          break;
        case "algorithm":
          result.algorithm = cleanValue;
          break;
      }
    }
  }

  return result;
}

async function md5Hash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("MD5", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function generateDigestAuthHeader(
  context: DigestContext,
  method: string,
  uri: string
): Promise<string> {
  const { username, password, nonce, nc, qop, opaque, algorithm, cnonce } = context;

  if (!nonce) {
    return "";
  }

  const ha1 = await md5Hash(`${username}:${context.realm}:${password}`);
  const ha2 = await md5Hash(`${method}:${uri}`);
  
  const ncStr = nc.toString().padStart(8, "0");
  const generatedCnonce = cnonce || crypto.randomUUID().replace(/-/g, "").slice(0, 16);

  let response: string;
  if (qop) {
    response = await md5Hash(`${ha1}:${nonce}:${ncStr}:${generatedCnonce}:${qop}:${ha2}`);
  } else {
    response = await md5Hash(`${ha1}:${nonce}:${ha2}`);
  }

  let authHeader = `Digest username="${username}", realm="${context.realm}", nonce="${nonce}", uri="${uri}", response="${response}"`;
  
  if (qop) {
    authHeader += `, qop=${qop}, nc=${ncStr}, cnonce="${generatedCnonce}"`;
  }
  
  if (opaque) {
    authHeader += `, opaque="${opaque}"`;
  }
  
  if (algorithm) {
    authHeader += `, algorithm=${algorithm}`;
  }

  return authHeader;
}

export function buildAuthHeaders(
  options: WebDAVClientOptions,
  authType: AuthType
): Headers {
  const headers: Headers = {};

  switch (authType) {
    case "password":
      if (options.username && options.password) {
        headers["Authorization"] = generateBasicAuthHeader(
          options.username,
          options.password
        );
      }
      break;
    case "token":
      if (options.token) {
        headers["Authorization"] = generateBearerAuthHeader(options.token);
      }
      break;
    case "digest":
      break;
    case "none":
    default:
      break;
  }

  return headers;
}

export function extractAuthFromResponse(response: Response): string | null {
  const authHeader = response.headers.get("WWW-Authenticate");
  if (authHeader) {
    return authHeader;
  }
  return null;
}
