import {appDataDir, join} from "@tauri-apps/api/path";
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
export const APP_VERSION = "1.0.0";

export const APP_PASSWORD = "6NU74Lx3gqKO5t"

let appData = '';

export const APP_DATA_DIR = () => appData;
export const APP_DATA_ASSET_DIR = async () => join(APP_DATA_DIR(), "asset");
export const APP_DATA_DB_DIR = async () => join(APP_DATA_DIR(), "db");
export const APP_DATA_STORE_DIR = async () => join(APP_DATA_DIR(), "store");
export const APP_DATA_HOLD_DIR = async () => join(APP_DATA_DIR(), "hold");

export const APP_DATA_GENERATE_DIR = async () => join(APP_DATA_DIR(), "generate");
export const APPDATA_CACHE_DIR = async () => join(APP_DATA_DIR(), "cache");

export const APP_DATA_DB_PATH = async (fileName: string) => join(await APP_DATA_DB_DIR(), `${fileName}.sqlite`);
export const APP_DATA_VAULT_PATH = async (vaultName: string) => join(await APP_DATA_HOLD_DIR(), `${vaultName}.hold`);
export const APP_DATA_STORE_PATH = async (storeName: string) => join(await APP_DATA_STORE_DIR(), `${storeName}.json`);

export const initPath = async () => {
  // 获取应用数据目录
  appData = await appDataDir();
  const items = await Promise.all([
    APP_DATA_ASSET_DIR(),
    APP_DATA_DB_DIR(),
    APP_DATA_STORE_DIR(),
    APP_DATA_HOLD_DIR(),
  ])
  for (const dir of items) {
    logDebug("初始化目录：" + dir);
    if (!await exists(dir)) {
      await mkdir(dir, {
        recursive: true
      })
    }
  }
};

// 主要
export const MAIN_MIGRATE_FILES = [{
  file: 'lib/migrate/0000_main.sql',
  version: 0
}, {
  file: 'lib/migrate/0001_folder.sql',
  version: 1
}];

export const {colorMode, isDark} = useColorMode();

export const [collapsed, toggleCollapsed] = useBoolState(false, LocalName.KEY_COLLAPSED);