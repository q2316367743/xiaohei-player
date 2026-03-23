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
  const filename = filePath.split(/[/\\]/).pop() || 'file';
  const encodedPath = encodeURIComponent(filePath);
  return `http://127.0.0.1:${serverPort}/file/${filename}?path=${encodedPath}`;
}

export function convertWebDavToUrl(
  filename: string,
  url: string,
  username?: string,
  password?: string,
  type?: string
): string {
  const encodedFilename = encodeURIComponent(filename);
  const encodedUrl = encodeURIComponent(url);
  const encodedUsername = encodeURIComponent(username || '');
  const encodedPassword = encodeURIComponent(password || '');
  const encodedType = type ? `&type=${encodeURIComponent(type)}` : '';
  return `http://127.0.0.1:${serverPort}/webdav/${encodedFilename}?url=${encodedUrl}&username=${encodedUsername}&password=${encodedPassword}${encodedType}`;
}

export function convertProxyToUrl(
  url: string,
  headers?: Record<string, string>
): string {
  const encodedUrl = encodeURIComponent(url);
  let queryString = '';
  
  if (headers) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(headers)) {
      params.append(key, value);
    }
    queryString = `?${params.toString()}`;
  }
  
  return `http://127.0.0.1:${serverPort}/proxy/${encodedUrl}${queryString}`;
}


export function convertSmbToUrl(
  url: string,
  clientId: string
): string {
  const filename = encodeURIComponent(url.split("\\").pop() || 'video.mp4');
  const encodedUrl = encodeURIComponent(url);

  return `http://127.0.0.1:${serverPort}/smb/${filename}?clientId=${clientId}&url=${encodedUrl}`;
}
