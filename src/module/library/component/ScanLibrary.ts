import {logDebug, logError, logInfo, logTrace, logWarning} from "@/lib/log.ts";
import {useLibrarySettingStore, useSystemSettingStore, useTaskSettingStore} from "@/lib/store.ts";
import {extname, join} from "@tauri-apps/api/path";
import {readDir, stat} from "@tauri-apps/plugin-fs";
import {deleteVideo, getVideoById, listVideo, saveVideo, updateVideo} from "@/service/VideoService.ts";
import type {LibrarySetting} from "@/entity/setting/LibrarySetting.ts";
import {generatePath, type GeneratePathResult} from "@/module/library/util.ts";
import type {SystemSetting} from "@/entity/setting/SystemSetting.ts";
import {sha256} from "@/util/lang/CryptoUtil.ts";
import {generatorLibrary} from "@/module/library/component/GenerateLibrary.ts";
import type {TaskSetting} from "@/entity/setting/TaskSetting.ts";
import {parseLibrary} from "@/module/library/component/ParseLibrary.ts";
import type {Video, VideoAddForm} from "@/entity/domain/Video.ts";
import {listLibrary, updateLibraryCover} from "@/service";
import type {LibraryEntity} from "@/entity/main/LibraryEntity.ts";
import {draw, group} from "@/util";

/**
 * 扫描视频文件
 * @param item 媒体库
 * @param library 媒体库设置
 * @param foundFiles 找到的文件
 */
async function collectVideoFiles(
  item: LibraryEntity,
  library: LibrarySetting,
  foundFiles: Map<string, VideoFile>
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
        if (!library.scanExtname.includes(en)) {
          logTrace("跳过非视频文件:", file.name, "扩展名:", en);
          continue;
        }

        foundFiles.set(newPath, {
          item: item,
          filePath: newPath,
          fileName: file.name
        });
        logTrace("发现视频文件:", file.name);
      }
    } catch (e) {
      logError("扫描目录时出错:", path, e);
    }
  }

  logDebug("目录扫描完成:", path);
}

interface VideoFile {
  item: LibraryEntity;
  filePath: string;
  fileName: string;
}

interface ProcessVideoFileProp {
  file: VideoFile;
  system: SystemSetting,
  task: TaskSetting,
  onProgress: (progress: number, total: number, message: string) => void,
  generatePath: GeneratePathResult;
}

/**
 * 处理视频文件
 */
async function processVideoFile(prop: ProcessVideoFileProp) {
  const {file, system, task, generatePath} = prop;
  const {filePath, fileName} = file;
  const {vttPrefixDir, screenshotDir, coverDir} = generatePath;
  const hash = await sha256(filePath);
  const old = await getVideoById(hash);

  if (old) {
    if (!task.reScanFile) {
      // 不重新扫描，跳过
      logDebug("视频已存在，跳过:", fileName);
      return old;
    }
  }

  logInfo("发现新视频:", fileName);

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

  const form: VideoAddForm = {
    // 基础信息
    library_id: file.item.id,
    file_name: fileName,
    file_path: filePath,
    file_size: fileStat.size,
    file_birthtime: fileStat.birthtime?.getTime() || 0,

    // 视频信息
    ...videoInfo,

    // 核心信息
    ...videoMetadata,

  };

  if (old) {
    // 更新
    await updateVideo(old.id, form)
  } else {
    await saveVideo(form, hash);
  }

  return form;

}

/**
 * 任务 - 扫描收藏库
 */
export async function scanLibrary(
  onProgress: (progress: number, total: number, message: string) => void,
  filterIds?: Array<string>
) {
  logInfo("开始扫描收藏库");
  const library = await useLibrarySettingStore().get();
  const system = await useSystemSettingStore().get();
  const task = await useTaskSettingStore().get();
  let items = await listLibrary();

  if (filterIds) {
    items = items.filter(item => filterIds.includes(item.id));
  }

  if (items.length === 0) {
    logWarning("收藏库为空，没有配置任何扫描路径");
    return;
  }

  logInfo("配置了", items.length, "个扫描路径");
  const foundFiles = new Map<string, VideoFile>();

  for (const item of items) {
    logInfo("扫描路径:", item);
    await collectVideoFiles(item, library, foundFiles);
  }

  logInfo("扫描完成，共发现", foundFiles.size, "个视频文件");
  onProgress(0, foundFiles.size, "扫描完成，共发现" + foundFiles.size + "个视频文件");

  // 生成指定目录
  const generatePathResult = await generatePath(system);

  let processedCount = 0;
  const processVideos = new Array<Video | VideoAddForm>();
  for (const file of foundFiles.values()) {
    try {
      const res = await processVideoFile({
        file,
        system,
        task,
        onProgress,
        generatePath: generatePathResult
      });
      processVideos.push(res);
    } catch (e) {
      logError("处理视频文件出错:", file.filePath, e);
    }
    processedCount++;
    onProgress(processedCount, foundFiles.size, `正在处理: ${file.fileName}`);
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

  // 随机封面
  const coverMap = group(processVideos, 'library_id');
  for (const fromElement of Array.from(coverMap.entries())) {
    const [libraryId, videos] = fromElement;
    const target = draw(videos);
    if (!target.cover_path) continue;
    await updateLibraryCover(libraryId, target.cover_path);
  }

  logInfo("清理完成，删除了", deletedCount, "个不存在的视频记录");
  onProgress(foundFiles.size, foundFiles.size, `扫描完成，发现 ${foundFiles.size} 个视频，清理 ${deletedCount} 个已删除的视频`);
}