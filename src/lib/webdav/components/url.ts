import type { WebDAVClientOptions } from "../types";

export function mergePaths(base: string, path: string): string {
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export function joinPaths(...paths: string[]): string {
  return paths
    .map((path, index) => {
      if (index === 0) {
        return path.endsWith("/") ? path.slice(0, -1) : path;
      }
      return path.startsWith("/") ? path.slice(1) : path;
    })
    .join("/");
}

export function normalizePath(path: string): string {
  if (!path) return "/";
  const normalized = path.replace(/\\/g, "/");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

export function extractBasename(path: string): string {
  const normalized = normalizePath(path);
  const segments = normalized.split("/").filter(Boolean);
  return segments.length > 0 ? segments[segments.length - 1]! : "";
}

export function extractDirname(path: string): string {
  const normalized = normalizePath(path);
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length <= 1) return "/";
  return `/${segments.slice(0, -1).join("/")}`;
}

export function buildRemoteURL(options: WebDAVClientOptions): string {
  const { remoteBasePath, remoteURL } = options;
  let baseURL = remoteURL || "";
  
  if (!baseURL) {
    throw new Error("remoteURL is required");
  }
  
  if (remoteBasePath) {
    baseURL = mergePaths(baseURL, remoteBasePath);
  }
  
  return baseURL.endsWith("/") ? baseURL : `${baseURL}/`;
}

export function getURLPath(url: string, baseURL: string): string {
  const normalizedBase = baseURL.endsWith("/") ? baseURL : `${baseURL}/`;
  if (url.startsWith(normalizedBase)) {
    return `/${url.slice(normalizedBase.length)}`;
  }
  return url;
}

export function encodePath(path: string): string {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function generateLockToken(): string {
  return `urn:uuid:${crypto.randomUUID()}`;
}
