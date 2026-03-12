import {logError, logInfo, logWarning} from "@/lib/log.ts";
import {useLibrarySettingStore, useSystemSettingStore, useTaskSettingStore} from "@/lib/store.ts";
import {generatePath} from "@/module/library/util.ts";
import type {Video, VideoAddForm} from "@/entity/domain/Video.ts";
import {listLibrary, updateLibraryCover} from "@/service";
import {draw, group} from "@/util";
import type {ScanVideoFile} from "@/module/library/types.ts";
import {collectVideoFiles} from "@/module/library/component/CollectLibrary.ts";
import {processVideoFile} from "@/module/library/component/ProcessVideoFile.ts";


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
  const foundFiles = new Map<string, ScanVideoFile>();

  for (const item of items) {
    logInfo("扫描路径:", item);
    await collectVideoFiles(item, library, foundFiles);
  }

  logInfo("扫描完成，共发现", foundFiles.size, "个视频文件");
  onProgress(0, foundFiles.size, "扫描完成，共发现" + foundFiles.size + "个视频文件");

  // 生成指定目录
  const generatePathResult = await generatePath();

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

  onProgress(foundFiles.size, foundFiles.size, "正在处理封面...");

  // 随机封面
  const coverMap = group(processVideos, 'library_id');
  for (const fromElement of Array.from(coverMap.entries())) {
    const [libraryId, videos] = fromElement;
    const target = draw(videos);
    if (!target.cover_path) continue;
    await updateLibraryCover(libraryId, target.cover_path);
  }

}