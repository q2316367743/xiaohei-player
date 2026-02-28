import {cleanDeletedVideo} from "@/service/VideoService.ts";

export async function cleanDeletedDb(
  onProgress: (progress: number, total: number, message: string) => void
) {
  console.info('[CleanDeletedDb] 开始清理已删除的数据库记录...');

  onProgress(0, 100, '开始清理...');
  console.info('[CleanDeletedDb] 正在清理已删除的视频记录...');

  const deletedCount = await cleanDeletedVideo();

  console.info(`[CleanDeletedDb] 清理完成，共删除 ${deletedCount} 条视频记录`);
  onProgress(100, 100, `清理完成，共删除 ${deletedCount} 条视频记录`);
}
