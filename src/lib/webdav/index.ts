import type {WebDAVClient, WebDAVClientOptions} from "@/lib/webdav/types.ts";
import {WebDAVClientImpl} from "@/lib/webdav/client.ts";

export function createWebDAVClient(options: WebDAVClientOptions): WebDAVClient {
  return new WebDAVClientImpl(options);
}