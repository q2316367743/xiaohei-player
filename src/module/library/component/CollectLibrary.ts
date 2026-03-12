import type {LibraryEntity} from "@/entity/main/LibraryEntity.ts";
import type {LibrarySetting} from "@/entity/setting/LibrarySetting.ts";
import {logDebug, logError, logTrace} from "@/lib/log.ts";
import {readDir} from "@tauri-apps/plugin-fs";
import {extname, join} from "@tauri-apps/api/path";
import type {ScanVideoFile} from "@/module/library/types.ts";

/**
 * 扫描视频文件
 * @param item 媒体库
 * @param library 媒体库设置
 * @param foundFiles 找到的文件
 */
export async function collectVideoFiles(
  item: LibraryEntity,
  library: LibrarySetting,
  foundFiles: Map<string, ScanVideoFile>
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
          fileDir: path,
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