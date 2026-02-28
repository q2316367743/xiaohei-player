import {invoke} from "@tauri-apps/api/core";
import {logError, logInfo} from "@/lib/log.ts";

let serverPort: number = 0;

export async function initServerPort(): Promise<void> {
  try {
    serverPort = await invoke<number>('get_server_port');
    logInfo('Server port:', serverPort)
  } catch (e) {
    logError('Failed to get server port:', e);
  }
}

export function convertFileSrcToUrl(filePath: string): string {
  const encodedPath = encodeURIComponent(filePath);
  return `http://127.0.0.1:${serverPort}/file?path=${encodedPath}`;
}

export function convertWebDavToUrl(
  url: string,
  username?: string,
  password?: string
): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedUsername = encodeURIComponent(username || '');
  const encodedPassword = encodeURIComponent(password || '');
  return `http://127.0.0.1:${serverPort}/webdav?url=${encodedUrl}&username=${encodedUsername}&password=${encodedPassword}`;
}
