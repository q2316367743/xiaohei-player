import {listAllVideoId} from "@/service";
import {exists, readDir, remove} from "@tauri-apps/plugin-fs";
import {logDebug, logError} from "@/lib/log.ts";
import {APP_DATA_GENERATE_DIR} from "@/global/Constants.ts";
import {joinPath} from "@/util/lang/FileUtil.ts";

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
      const filePath = joinPath(path, file.name);
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
  const videos = await listAllVideoId();
  const videoNames = videos.map(v => v.id);

  // 获取生成目录
  const generateDir = APP_DATA_GENERATE_DIR();

  const coverDir = joinPath(generateDir, "cover");
  const screenshotDir = joinPath(generateDir, "screenshot");
  const vttDir = joinPath(generateDir, "vtt");
  const markerDir = joinPath(generateDir, "marker");

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