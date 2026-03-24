import {appDataDir} from "@tauri-apps/api/path";
import {joinPath} from '@/util/lang/FileUtil';
import {exists, mkdir} from "@tauri-apps/plugin-fs";
import {useColorMode} from "@/hooks/ColorMode.ts";
import {useBoolState} from "@/hooks";
import {logDebug} from "@/lib/log.ts";
import {LocalName} from "@/global/LocalName.ts";

export const APP_ID = 'xyz.esion.xiaohei-player';
export const APP_NAME = "小黑影音";
export const APP_DESC = "小黑影音是一个本地影音管理软件";
export const APP_AUTHOR = "Esion";
export const APP_GITHUB = 'https://github.com/q2316367743/xiaohei-player'
export const APP_VERSION = "1.1.1";

export const APP_PASSWORD = "6NU74Lx3gqKO5t"

let appData = '';

export const APP_DATA_DIR = () => appData;
export const APP_DATA_ASSET_DIR = () => joinPath(APP_DATA_DIR(), "asset");
export const APP_DATA_DB_DIR = () => joinPath(APP_DATA_DIR(), "db");
export const APP_DATA_STORE_DIR = () => joinPath(APP_DATA_DIR(), "store");
export const APP_DATA_HOLD_DIR = () => joinPath(APP_DATA_DIR(), "hold");

export const APP_DATA_GENERATE_DIR = () => joinPath(APP_DATA_DIR(), "generate");
export const APPDATA_CACHE_DIR = () => joinPath(APP_DATA_DIR(), "cache");

export const APP_DATA_DB_PATH = (fileName: string) => joinPath(APP_DATA_DB_DIR(), `${fileName}.sqlite`);
export const APP_DATA_VAULT_PATH = (vaultName: string) => joinPath(APP_DATA_HOLD_DIR(), `${vaultName}.hold`);
export const APP_DATA_STORE_PATH = (storeName: string) => joinPath(APP_DATA_STORE_DIR(), `${storeName}.json`);

export const initPath = async () => {
  // 获取应用数据目录
  appData = await appDataDir();
  const items = [
    APP_DATA_ASSET_DIR(),
    APP_DATA_DB_DIR(),
    APP_DATA_STORE_DIR(),
    APP_DATA_HOLD_DIR(),
    APP_DATA_GENERATE_DIR()
  ]
  for (const dir of items) {
    logDebug("初始化目录：" + dir);
    if (!await exists(dir)) {
      await mkdir(dir, {
        recursive: true
      })
    }
  }

  const dataPath = APP_DATA_GENERATE_DIR();
  const vttPrefixDir = joinPath(dataPath, "vtt");
  const screenshotDir = joinPath(dataPath, "screenshot");
  const coverDir = joinPath(dataPath, "cover");
  if (!await exists(vttPrefixDir)) await mkdir(vttPrefixDir, {recursive: true});
  if (!await exists(screenshotDir)) await mkdir(screenshotDir, {recursive: true});
  if (!await exists(coverDir)) await mkdir(coverDir, {recursive: true});
};

// 主要
export const MAIN_MIGRATE_FILES = [{
  file: 'lib/migrate/0000_main.sql',
  version: 0
}, {
  file: 'lib/migrate/0001_folder.sql',
  version: 1
}, {
  file: 'lib/migrate/0002_media.sql',
  version: 2
}];

export const {colorMode, isDark} = useColorMode();

export const [collapsed, toggleCollapsed] = useBoolState(false, LocalName.KEY_COLLAPSED);