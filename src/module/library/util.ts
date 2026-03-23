import {APP_DATA_GENERATE_DIR} from "@/global/Constants.ts";
import {joinPath} from "@/util/lang/FileUtil.ts";

export interface GeneratePathResult {
  vttPrefixDir: string;
  screenshotDir: string;
  coverDir: string;
}

export function generatePath(): GeneratePathResult {
  const dataPath = APP_DATA_GENERATE_DIR();
  const vttPrefixDir = joinPath(dataPath, "vtt");
  const screenshotDir = joinPath(dataPath, "screenshot");
  const coverDir = joinPath(dataPath, "cover");
  return {
    vttPrefixDir,
    screenshotDir,
    coverDir
  }
}