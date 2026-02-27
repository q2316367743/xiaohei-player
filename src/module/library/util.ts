import {appDataDir, join} from "@tauri-apps/api/path";
import {exists, mkdir} from "@tauri-apps/plugin-fs";
import type {SystemSetting} from "@/entity/setting/SystemSetting.ts";

export async function generatePath(system: SystemSetting) {

  const appData = await appDataDir();
  const vttPrefixDir = await join(appData, system.dataPath, "vtt");
  const screenshotDir = await join(appData, system.dataPath, "screenshots");
  const coverDir = await join(appData, system.dataPath, "cover");
  if (!await exists(vttPrefixDir)) await mkdir(vttPrefixDir, {recursive: true});
  if (!await exists(screenshotDir)) await mkdir(screenshotDir, {recursive: true});
  if (!await exists(coverDir)) await mkdir(coverDir, {recursive: true});
  return {
    vttPrefixDir,
    screenshotDir,
    coverDir
  }
}