import {listAllVideo} from "@/service";
import {join} from "@tauri-apps/api/path";
import {exists, readDir, remove} from "@tauri-apps/plugin-fs";
import {logDebug, logError} from "@/lib/log.ts";
import {APP_DATA_GENERATE_DIR} from "@/global/Constants.ts";

async function handleFolder(path: string, videoNames: Array<string>, extname: string) {
  if (!await exists(path)) {
    return;
  }
  const files = await readDir(path);
  const names = new Set(videoNames.map(e => `${e}${extname}`));
  for (const file of files) {
    if (file.isFile) {
      // 文件比对后缀名
      if (!file.name.endsWith(extname)) continue;
    }
    // 其他的只需要比对名字
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

  // 获取全部视频
  const videos = await listAllVideo();
  const videoNames = videos.map(v => v.id);

  // 获取生成目录
  const generateDir = await APP_DATA_GENERATE_DIR();

  const coverDir = await join(generateDir, "cover");
  const screenshotDir = await join(generateDir, "screenshot");
  const vttDir = await join(generateDir, "vtt");
  const markerDir = await join(generateDir, "marker");

  try {
    onProgress(1, 5, "正在处理封面");
    logDebug("正在处理封面");
    await handleFolder(coverDir, videoNames, '.jpg');
  } catch (e) {
    logError('处理封面失败', e);
  }
  try {
    onProgress(2, 5, "正在处理快照");
    logDebug("正在处理快照");
    await handleFolder(screenshotDir, videoNames, '.mp4');
  } catch (e) {
    logError('处理快照失败', e);
  }
  try {
    onProgress(3, 5, "正在处理 vtt 切图");
    logDebug("正在处理 vtt 切图");
    await handleFolder(vttDir, videoNames, '_sprite.jpg');
  } catch (e) {
    logError('处理 vtt 切图失败', e);
  }
  try {
    onProgress(4, 5, "正在处理 vtt 文件");
    logDebug("正在处理 vtt 文件");
    await handleFolder(vttDir, videoNames, '_thumbs.vtt');
  } catch (e) {
    logError('处理 vtt 文件失败', e);
  }
  try {
    onProgress(5, 5, "正在处理 vtt 文件");
    logDebug("正在处理标记文件");
    await handleFolder(markerDir, videoNames, '');
  } catch (e) {
    logError('处理标记失败', e);
  }
}