import {useSql} from "@/lib/sql.ts";
import type {Video} from "@/entity/domain/Video.ts";

export async function existVideo(id: string) {
  const count = await useSql().query<Video>('video')
    .eq('id', id)
    .count();
  return count > 0;
}

export async function saveVideo(video: Video) {
  await useSql().mapper<Video>('video').insertSelf(video);
}

export async function getAllVideos() {
  return await useSql().query<Video>('video').eq('is_deleted', 0).list();
}

export async function getVideoById(id: string) {
  const videos = await useSql().query<Video>('video')
    .eq('id', id)
    .eq('is_deleted', 0)
    .list();
  return videos.length > 0 ? videos[0] : null;
}

export async function deleteVideo(id: string) {
  await useSql().mapper<Video>('video').updateById(id, {is_deleted: 1});
}

export async function deleteVideoByPath(filePath: string) {
  const videos = await useSql().query<Video>('video').eq('file_path', filePath).list();
  for (const video of videos) {
    await deleteVideo(video.id);
  }
}