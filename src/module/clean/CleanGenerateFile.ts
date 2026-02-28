import {listAllVideo} from "@/service";
import {appDataDir, join} from "@tauri-apps/api/path";
import {useSystemSettingStore} from "@/lib/store.ts";
import {readDir, remove} from "@tauri-apps/plugin-fs";
import {logError} from "@/lib/log.ts";

async function handleFolder(path: string, videoNames: Array<string>, extname: string) {
  const files = await readDir(path);
  const names = new Set(videoNames.map(e => `${e}${extname}`));
  for (const file of files) {
    // 不是文件
    if (!file.isFile) continue;
    // 不是目标文件
    if (!file.name.endsWith(extname)) continue;
    if (!names.has(file.name)) {
      const filePath = await join(path, file.name);
      // 没有该文件，删除
      await remove(filePath);
    }
  }
}

/**
 * 清除已生成的文件
 * @param onProgress
 */
export async function cleanGenerateFile(
  onProgress: (progress: number, total: number, message: string) => void
) {
  const system = await useSystemSettingStore().get();

  // 获取全部视频
  const videos = await listAllVideo();
  const videoNames = videos.map(v => v.id);

  // 获取生成目录
  const app = await appDataDir();
  const generateDir = await join(app, system.dataPath);

  const coverDir = await join(generateDir, "cover");
  const screenshotDir = await join(generateDir, "screenshot");
  const vttDir = await join(generateDir, "vtt");

  try {
    onProgress(1, 4, "正在处理封面");
    await handleFolder(coverDir, videoNames, '.jpg');
  } catch (e) {
    logError('处理封面失败', e);
  }
  try {
    onProgress(2, 4, "正在处理快照");
    await handleFolder(screenshotDir, videoNames, '.mp4');
  } catch (e) {
    logError('处理封面失败', e);
  }
  try {
    onProgress(3, 4, "正在处理 vtt 切图");
    await handleFolder(vttDir, videoNames, '_sprite.jpg');
  } catch (e) {
    logError('处理封面失败', e);
  }
  try {
    onProgress(3, 4, "正在处理 vtt 文件");
    await handleFolder(vttDir, videoNames, '_thumbs.vtt');
  } catch (e) {
    logError('处理封面失败', e);
  }
}