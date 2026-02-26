import {exists, mkdir, readDir, stat} from '@tauri-apps/plugin-fs';
import {join, extname, appDataDir} from "@tauri-apps/api/path";
import {useLibrarySettingStore, useSystemSettingStore} from "@/lib/store.ts";
import type {LibraryItem, LibrarySetting} from "@/entity/setting/LibrarySetting.ts";
import type {SystemSetting} from "@/entity/setting/SystemSetting.ts";
import {sha256} from "@/util/lang/CryptoUtil.ts";
import {existVideo, saveVideo, getAllVideos, deleteVideo} from "@/service/VideoService.ts";
import {generatePreview, generateVtt, getVideoDuration} from "@/module/library/command/FfmpegCommand.ts";
import {logError, logInfo, logDebug, logWarning, logTrace} from "@/lib/log.ts";

async function collectVideoFiles(
  item: LibraryItem,
  library: LibrarySetting,
  foundFiles: Set<string>
) {
  const {path} = item;
  logDebug("开始扫描目录:", path);
  const files = await readDir(path);
  logTrace("目录", path, "包含", files.length, "个文件/文件夹");

  for (const file of files) {
    try {
      const newPath = await join(path, file.name);
      if (file.isDirectory) {
        logDebug("进入子目录:", newPath);
        await collectVideoFiles({...item, path: newPath}, library, foundFiles);
      } else if (file.isFile) {
        const en = await extname(file.name);
        if (!library.videoExtname.includes(en)) {
          logTrace("跳过非视频文件:", file.name, "扩展名:", en);
          continue;
        }

        foundFiles.add(newPath);
        logTrace("发现视频文件:", file.name);
      }
    } catch (e) {
      logError("扫描目录时出错:", path, e);
    }
  }

  logDebug("目录扫描完成:", path);
}

async function processVideoFile(
  filePath: string,
  fileName: string,
  system: SystemSetting,
  onProgress: (progress: number, total: number, message: string) => void,
  vttPrefixDir: string,
  screenshotDir: string
) {
  const hash = await sha256(filePath);
  const exist = await existVideo(hash);
  if (exist) {
    logDebug("视频已存在，跳过:", fileName);
    return;
  }

  logInfo("发现新视频:", fileName);
  onProgress(0, 0, `正在处理: ${fileName}`);

  const vttPrefixPath = await join(vttPrefixDir, hash);
  const screenshot = await join(screenshotDir, hash + '.mp4');
  
  const fileStat = await stat(filePath);
  let duration_ms = 0;
  
  try {
    const durationMs = await getVideoDuration(system.ffmpegPath, filePath);
    duration_ms = Number(durationMs);
    logDebug("获取视频时长成功:", fileName, duration_ms, "ms");
  } catch (e) {
    logError("视频文件损坏或无法读取，跳过:", fileName, e);
    return;
  }
  let sprite = '';
  let thumbs = '';

  try {
    logDebug("生成字幕文件:", vttPrefixPath);
    const vtt = await generateVtt(system.ffmpegPath, filePath, vttPrefixPath);
    sprite = vtt.sprite;
    thumbs = vtt.thumbs
  } catch (e) {
    logError("生成字幕文件失败，跳过:", fileName, e);
    return;
  }

  try {
    logDebug("生成预览视频:", screenshot);
    await generatePreview(system.ffmpegPath, filePath, screenshot, duration_ms);
  } catch (e) {
    logError("生成预览视频失败，跳过:", fileName, e);
    return;
  }

  logInfo("保存视频信息:", fileName, "大小:", fileStat.size, "字节");
  await saveVideo({
    id: hash,
    file_name: fileName,
    file_path: filePath,
    screenshot_path: screenshot,
    sprite_path: sprite,
    vtt_path: thumbs,
    file_size: fileStat.size,
    duration_ms: duration_ms,
    width: 0,
    height: 0,
    container_format: await extname(fileName),
    video_codec: '',
    audio_codec: '',
    title: fileName,
    description: '',
    release_date: '',
    last_played_at: 0,
    play_count: 0,
    is_deleted: 0,
    scan_status: 'completed',
    error_message: '',
    created_at: Date.now(),
    updated_at: Date.now()
  });
}

/**
 * 扫描收藏库
 */
export async function scanLibrary(
  onProgress: (progress: number, total: number, message: string) => void
) {
  logInfo("开始扫描收藏库");
  const library = await useLibrarySettingStore().get();
  const system = await useSystemSettingStore().get();
  if (library.items.length === 0) {
    logWarning("收藏库为空，没有配置任何扫描路径");
    return;
  }

  logInfo("配置了", library.items.length, "个扫描路径");
  const foundFiles = new Set<string>();

  for (const item of library.items) {
    logInfo("扫描路径:", item.path);
    await collectVideoFiles(item, library, foundFiles);
  }

  logInfo("扫描完成，共发现", foundFiles.size, "个视频文件");
  onProgress(0, foundFiles.size, "扫描完成，共发现" + foundFiles.size + "个视频文件");

  const appData = await appDataDir();
  const vttPrefixDir = await join(appData, system.dataPath, "vtt");
  const screenshotDir = await join(appData, system.dataPath, "screenshots");
  if (!await exists(vttPrefixDir)) await mkdir(vttPrefixDir, {recursive: true});
  if (!await exists(screenshotDir)) await mkdir(screenshotDir, {recursive: true});

  let processedCount = 0;
  for (const filePath of foundFiles) {
    const fileName = filePath.split('/').pop() || filePath;
    try {
      await processVideoFile(filePath, fileName, system, onProgress, vttPrefixDir, screenshotDir);
      processedCount++;
      onProgress(processedCount, foundFiles.size, `正在处理: ${fileName}`);
    } catch (e) {
      logError("处理视频文件出错:", filePath, e);
    }
  }

  onProgress(foundFiles.size, foundFiles.size, "正在清理已删除的视频...");

  const allVideos = await getAllVideos();
  logDebug("数据库中共有", allVideos.length, "个视频记录");
  let deletedCount = 0;

  for (const video of allVideos) {
    if (!foundFiles.has(video.file_path)) {
      logWarning("视频文件不存在，标记为已删除:", video.file_path);
      await deleteVideo(video.id);
      deletedCount++;
    }
  }

  logInfo("清理完成，删除了", deletedCount, "个不存在的视频记录");
  onProgress(foundFiles.size, foundFiles.size, `扫描完成，发现 ${foundFiles.size} 个视频，清理 ${deletedCount} 个已删除的视频`);
}