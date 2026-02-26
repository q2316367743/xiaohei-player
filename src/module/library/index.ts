import {readDir, stat} from '@tauri-apps/plugin-fs';
import {join, extname, appDataDir} from "@tauri-apps/api/path";
import {useLibrarySettingStore, useSystemSettingStore} from "@/lib/store.ts";
import type {LibraryItem, LibrarySetting} from "@/entity/setting/LibrarySetting.ts";
import type {SystemSetting} from "@/entity/setting/SystemSetting.ts";
import {sha256} from "@/util/lang/CryptoUtil.ts";
import {existVideo, saveVideo, getAllVideos, deleteVideo} from "@/service/VideoService.ts";
import {generatePreview, generateVtt, getVideoDuration} from "@/module/library/command/FfmpegCommand.ts";
import {logError} from "@/lib/log.ts";

async function scanDir(
  item: LibraryItem,
  library: LibrarySetting,
  system: SystemSetting,
  onProgress: (progress: number, total: number, message: string) => void,
  foundFiles: Set<string>
) {
  const {path} = item;
  const files = await readDir(path);
  
  for (const file of files) {
    const newPath = await join(path, file.name);
    if (file.isDirectory) {
      await scanDir({...item, path: newPath}, library, system, onProgress, foundFiles);
    }else if (file.isFile) {
      const en = await extname(file.name);
      if (!library.videoExtname.includes(en)) continue;
      
      foundFiles.add(newPath);
      
      const hash = await sha256(newPath);
      const exist = await existVideo(hash);
      if (exist) continue;
      
      onProgress(foundFiles.size, 0, `正在扫描: ${file.name}`);
      
      const appData = await appDataDir();
      const vttPrefixPath = await join(appData, system.dataPath, "vtt", hash);
      await generateVtt(system.ffmpegPath, newPath, vttPrefixPath);
      
      const screenshot = await join(appData, system.dataPath, "screenshots", hash + '.mp4');
      await generatePreview(system.ffmpegPath, newPath, screenshot);
      
      const fileStat = await stat(newPath);
      let duration_ms = 0;
      try {
        const durationMs = await getVideoDuration(system.ffmpegPath, newPath);
        duration_ms = Number(durationMs);
      }catch (e) {
        logError("获取视频时长失败", e);
      }
      
      saveVideo({
        id: hash,
        file_name: file.name,
        file_path: newPath,
        file_size: fileStat.size,
        duration_ms: duration_ms,
        width: 0,
        height: 0,
        container_format: en,
        video_codec: '',
        audio_codec: '',
        title: file.name,
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
  }
}

/**
 * 扫描收藏库
 */
export async function scanLibrary(
  onProgress: (progress: number, total: number, message: string) => void
) {
  const library = await useLibrarySettingStore().get();
  const system = await useSystemSettingStore().get();
  if (library.items.length === 0) return;
  
  const foundFiles = new Set<string>();
  
  for (const item of library.items) {
    await scanDir(item, library, system, onProgress, foundFiles);
  }
  
  onProgress(foundFiles.size, foundFiles.size, "正在清理已删除的视频...");
  
  const allVideos = await getAllVideos();
  let deletedCount = 0;
  
  for (const video of allVideos) {
    if (!foundFiles.has(video.file_path)) {
      await deleteVideo(video.id);
      deletedCount++;
    }
  }
  
  onProgress(foundFiles.size, foundFiles.size, `扫描完成，发现 ${foundFiles.size} 个视频，清理 ${deletedCount} 个已删除的视频`);
}