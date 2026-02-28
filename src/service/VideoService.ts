import {useSql} from "@/lib/sql.ts";
import type {Video, VideoAddForm, VideoStatusInfo} from "@/entity/domain/Video.ts";
import {saveOrUpdateActor} from "@/service/ActorService.ts";
import {saveOrUpdateTag} from "@/service/TagService.ts";
import {saveOrUpdateStudio} from "@/service/StudioService.ts";
import type {YesOrNo} from "@/global/CommonType.ts";

export async function existVideo(id: string) {
  const count = await useSql().query<Video>('video')
    .eq('id', id)
    .count();
  return count > 0;
}


export async function saveVideo(from: VideoAddForm, hash: string) {
  const now = Date.now();
  const {actors, tags, studio, ...video} = from;

  // 先处理工作室
  const studio_id = await saveOrUpdateStudio(studio);
  // 处理演员
  await saveOrUpdateActor(actors, hash);
  // 处理标签
  await saveOrUpdateTag(tags, hash);

  await useSql().mapper<Video>('video').insertSelf({
    ...video,
    studio_id,
    id: hash,
    created_at: now,
    updated_at: now,
    // 状态信息
    last_played_at: 0,
    play_count: 0,
    is_deleted: 0,
    scan_status: 'completed',
    error_message: '',
  });
}

export async function updateVideo(id: string, from: Partial<VideoAddForm>) {
  const now = Date.now();
  const {actors, tags, studio, ...video} = from;

  let studio_id: string | undefined = undefined;
  // 先处理工作室
  if (studio) {
    studio_id = await saveOrUpdateStudio(studio);
  }
  // 处理演员
  if (actors) await saveOrUpdateActor(actors, id);
  // 处理标签
  if (tags) await saveOrUpdateTag(tags, id);

  await useSql().mapper<Video>('video').updateById(id, {
    ...video,
    studio_id,
    updated_at: now
  });
}

export async function updateVideoStatus(id: string, form: Partial<VideoStatusInfo>) {
  await useSql().mapper<Video>('video').updateById(id, {
    ...form,
    updated_at: Date.now()
  });
}

export type VideoSortField = 'file_name'
  | 'file_size' | 'created_at' | 'updated_at' | 'duration_ms' | 'fps'
  | 'release_date'
  | 'file_birthtime';
export type SortOrder = 'ASC' | 'DESC';

export async function pageVideo(
  page: number = 1,
  size: number = 20,
  order: VideoSortField = 'file_name',
  type: SortOrder = 'ASC',
  hidden?: YesOrNo
) {
  return useSql().query<Video>('video')
    .eq('is_deleted', 0)
    .eq('hidden', hidden)
    .order(order, type)
    .page(page, size);
}

export async function listVideo() {
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