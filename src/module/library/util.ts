import {join} from "@tauri-apps/api/path";
import {exists, mkdir} from "@tauri-apps/plugin-fs";
import {APP_DATA_GENERATE_DIR} from "@/global/Constants.ts";

export interface GeneratePathResult {
  vttPrefixDir: string;
  screenshotDir: string;
  coverDir: string;
}

export async function generatePath(): Promise<GeneratePathResult> {

  const dataPath = await APP_DATA_GENERATE_DIR();
  const vttPrefixDir = await join(dataPath, "vtt");
  const screenshotDir = await join(dataPath, "screenshot");
  const coverDir = await join(dataPath, "cover");
  if (!await exists(vttPrefixDir)) await mkdir(vttPrefixDir, {recursive: true});
  if (!await exists(screenshotDir)) await mkdir(screenshotDir, {recursive: true});
  if (!await exists(coverDir)) await mkdir(coverDir, {recursive: true});
  return {
    vttPrefixDir,
    screenshotDir,
    coverDir
  }
}