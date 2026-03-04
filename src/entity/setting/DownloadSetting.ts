import {downloadDir} from "@tauri-apps/api/path";
import {join} from "@/module/file/util.ts";

export interface DownloadSetting {

  /**
   * 抖音视频保存路径
   */
  douyin: string;

  /**
   * 哔哩哔哩视频保存路径
   */
  bilibili: string;

}

export const downloadSettingPaths: Array<keyof DownloadSetting> = [
  'douyin',
  'bilibili'
]

export const DownloadSettingTitle = {
  douyin: '抖音视频保存路径',
  bilibili: '哔哩哔哩视频保存路径'
}

/**
 * 初始化下载路径
 * @param subpath
 */
export async function initDownloadSettingPath<K extends keyof DownloadSetting>(subpath: K) {
  const path = await downloadDir();
  return join(path, subpath);
}
export function getDownloadSetting(): DownloadSetting {
  return {
    douyin: '',
    bilibili: ''
  }
}