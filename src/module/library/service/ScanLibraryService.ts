import {logError, logInfo, logWarning} from "@/lib/log.ts";
import {useLibrarySettingStore, useSystemSettingStore, useTaskSettingStore} from "@/lib/store.ts";
import {generatePath} from "@/module/library/util.ts";
import type {Video, VideoAddForm, VideoView} from "@/entity/domain/Video.ts";
import {getLibrary, listLibrary, updateLibraryCover} from "@/service";
import {draw, group} from "@/util";
import type {ScanVideoFile} from "@/module/library/types.ts";
import {
  buildDirEntryMap,
  collectVideoFiles,
  findCaption,
  findCoverFile, findNfoFile
} from "@/module/library/component/CollectLibrary.ts";
import {processVideoFile} from "@/module/library/component/ProcessVideoFile.ts";
import {dirname, parseFilename} from "@/util/lang/FileUtil.ts";
import {readDir} from "@tauri-apps/plugin-fs";


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
  const generatePathResult = generatePath();

  let processedCount = 0;
  const processVideos = new Array<Video | VideoAddForm>();

  const {threadNum} = task;
  const files = Array.from(foundFiles.values());
  let nextIndex = 0;

  async function processNext() {
    while (true) {
      const index = nextIndex++;
      const file = files[index];
      if (!file) break;
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
      onProgress(processedCount, files.length, `正在处理: ${file.fileName}`);
    }
  }

  const workers = Array(Math.min(threadNum, files.length))
    .fill(null)
    .map(() => processNext());
  await Promise.all(workers);

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

export async function scanOneLibrary(video: VideoView) {
  const system = await useSystemSettingStore().get();
  const task = await useTaskSettingStore().get();
  const generatePathResult = generatePath();

  const dir = dirname(video.file_path);
  const library = await getLibrary(video.library_id);
  const files = await readDir(dir)
  const [filename] = parseFilename(video.file_name);


  const fileMap = buildDirEntryMap(files.filter(e => e.isFile));


  await processVideoFile({
    file: {
      item: library!,
      fileDir: dir,
      filePath: video.file_path,
      fileName: video.file_name,
      caption: findCaption(dir, filename, files),
      cover: findCoverFile(dir, filename, fileMap),
      nfo: await findNfoFile(dir, filename, fileMap)
    },
    system,
    task,
    onProgress: () => {
    },
    generatePath: generatePathResult
  });

}