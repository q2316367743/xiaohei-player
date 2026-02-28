import {exists} from "@tauri-apps/plugin-fs";

import {deleteVideo, listVideo} from "@/service";
import {logError} from "@/lib/log.ts";

/**
 * 清理已被删除的视频
 * @param onProgress
 */
export async function cleanDeletedVideo(
  onProgress: (progress: number, total: number, message: string) => void
) {
  // 获取全部视频
  const videos = await listVideo();
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i]!;
    onProgress(i, videos.length, `正在清理 ${video.file_name}`);
    try {
      const has = await exists(video.file_path);
      if (!has) {
        await deleteVideo(video.id);
      }
    }catch ( e) {
      logError(`清理 ${video.file_name} 失败`, e);
    }
  }
}