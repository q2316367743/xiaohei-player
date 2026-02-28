import {convertFileSrc} from "@tauri-apps/api/core";

export function convertFileSrcToUrl(filePath: string): string{
  return convertFileSrc(filePath);
}