import {appDataDir, join} from "@tauri-apps/api/path";
import {exists, mkdir} from "@tauri-apps/plugin-fs";
import {useColorMode} from "@/hooks/ColorMode.ts";
import {useBoolState} from "@/hooks";
import {logDebug} from "@/lib/log.ts";

export const APP_NAME = "xiaoheiplayer";
export const APP_VERSION = "1.0.0";
export const APP_PASSWORD = "6NU74Lx3gqKO5t"

export const APP_DATA_DIR = () => appDataDir();
export const APP_DATA_ASSET_DIR = async () => join(await APP_DATA_DIR(), "asset");
export const APP_DATA_DB_DIR = async () => join(await APP_DATA_DIR(), "db");
export const APP_DATA_STORE_DIR = async () => join(await APP_DATA_DIR(), "store");
export const APP_DATA_HOLD_DIR = async () => join(await APP_DATA_DIR(), "hold");


export const APP_DATA_DB_PATH = async (fileName:string) => join(await APP_DATA_DB_DIR(), `${fileName}.sqlite`);
export const APP_DATA_VAULT_PATH = async (vaultName: string) => join(await APP_DATA_HOLD_DIR(), `${vaultName}.hold`);
export const APP_DATA_STORE_PATH = async (storeName: string) => join(await APP_DATA_STORE_DIR(), `${storeName}.json`);

export const initPath = async () => {
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
}];

export const {colorMode, isDark} = useColorMode();

export const [collapsed, toggleCollapsed] = useBoolState( false);