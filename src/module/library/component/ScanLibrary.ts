import {logDebug, logError, logInfo, logTrace, logWarning} from "@/lib/log.ts";
import {useLibrarySettingStore, useSystemSettingStore, useTaskSettingStore} from "@/lib/store.ts";
import {extname, join} from "@tauri-apps/api/path";
import {readDir, stat} from "@tauri-apps/plugin-fs";
import {deleteVideo, getVideoById, listVideo, saveVideo, updateVideo} from "@/service/VideoService.ts";
import type {LibraryItem, LibrarySetting} from "@/entity/setting/LibrarySetting.ts";
import {generatePath} from "@/module/library/util.ts";
import type {SystemSetting} from "@/entity/setting/SystemSetting.ts";
import {sha256} from "@/util/lang/CryptoUtil.ts";
import {generatorLibrary} from "@/module/library/component/GenerateLibrary.ts";
import type {TaskSetting} from "@/entity/setting/TaskSetting.ts";
import {parseLibrary} from "@/module/library/component/ParseLibrary.ts";
import type {VideoEditForm} from "@/entity/domain/Video.ts";

/**
 * 扫描视频文件
 * @param item 媒体库
 * @param library 媒体库设置
 * @param foundFiles 找到的文件
 */
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

/**
 * 处理视频文件
 * @param filePath 视频文件路径
 * @param fileName 视频文件名
 * @param system 设置
 * @param task 任务设置
 * @param onProgress 进度回调
 * @param vttPrefixDir 字幕文件前缀
 * @param screenshotDir 截图文件目录
 * @param coverDir 封面文件目录
 */
async function processVideoFile(
  filePath: string,
  fileName: string,
  system: SystemSetting,
  task: TaskSetting,
  onProgress: (progress: number, total: number, message: string) => void,
  vttPrefixDir: string,
  screenshotDir: string,
  coverDir: string,
) {
  const hash = await sha256(filePath);
  const old = await getVideoById(hash);

  if (old) {
    if (!task.reScanFile) {
      // 不重新扫描，跳过
      logDebug("视频已存在，跳过:", fileName);
      return;
    }
  }

  logInfo("发现新视频:", fileName);
  onProgress(0, 0, `正在处理: ${fileName}`);

  const fileStat = await stat(filePath);

  const videoInfo = await generatorLibrary({
    hash,
    filePath,
    system,
    task,
    coverDir,
    fileName,
    screenshotDir,
    vttPrefixDir
  });
  const videoMetadata = await parseLibrary({
    filePath,
    fileName
  });

  const form: VideoEditForm = {
    // 基础信息
    file_name: fileName,
    file_path: filePath,
    file_size: fileStat.size,
    file_birthtime: fileStat.birthtime?.getTime() || 0,

    // 视频信息
    ...videoInfo,

    // 核心信息
    ...videoMetadata,

    // 状态信息
    last_played_at: 0,
    play_count: 0,
    is_deleted: 0,
    scan_status: 'completed',
    error_message: '',

  };

  if (old) {
    // 更新
    await updateVideo(old.id, form)
  } else {
    await saveVideo(form, hash);
  }

}

/**
 * 任务 - 扫描收藏库
 */
export async function scanLibrary(
  onProgress: (progress: number, total: number, message: string) => void
) {
  logInfo("开始扫描收藏库");
  const library = await useLibrarySettingStore().get();
  const system = await useSystemSettingStore().get();
  const task = await useTaskSettingStore().get();
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

  // 生成指定目录
  const {vttPrefixDir, screenshotDir, coverDir} = await generatePath(system);

  let processedCount = 0;
  for (const filePath of foundFiles) {
    const fileName = filePath.split('/').pop() || filePath;
    try {
      await processVideoFile(
        filePath, fileName, system, task, onProgress, vttPrefixDir, screenshotDir, coverDir);
    } catch (e) {
      logError("处理视频文件出错:", filePath, e);
    }
    processedCount++;
    onProgress(processedCount, foundFiles.size, `正在处理: ${fileName}`);
  }

  onProgress(foundFiles.size, foundFiles.size, "正在清理已删除的视频...");

  const allVideos = await listVideo();
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