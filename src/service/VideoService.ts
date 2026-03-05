import {useSql} from "@/lib/sql.ts";
import type {
  Video,
  VideoActorIdForm,
  VideoAddForm,
  VideoMetadata,
  VideoStatusInfo
} from "@/entity/domain/Video.ts";
import {saveOrUpdateActor, saveVideoActor} from "@/service/ActorService.ts";
import {saveOrUpdateTag, saveVideoTag} from "@/service/TagService.ts";
import {saveOrUpdateStudio} from "@/service/StudioService.ts";
import type {VideoActor} from "@/entity/domain/VideoActor.ts";
import type {VideoTag} from "@/entity/domain/VideoTag.ts";


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

export async function updateVideo(id: string, form: Partial<VideoAddForm>) {
  const now = Date.now();
  const {actors, tags, studio, ...video} = form;

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

export async function updateVideoMetadata(id: string, form: VideoMetadataForm) {
  const {actorIds, tagIds, ...video} = form;
  // 处理演员
  await saveVideoActor(id, actorIds);
  // 处理标签
  await saveVideoTag(id, tagIds);
  const now = Date.now();
  await useSql().mapper<Video>('video').updateById(id, {
    ...video,
    updated_at: now
  });
}

export async function updateVideoStatus(id: string, form: Partial<VideoStatusInfo>) {
  await useSql().mapper<Video>('video').updateById(id, {
    ...form,
    updated_at: Date.now()
  });
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

export async function cleanDeletedVideo() {
  const deletedVideos = await useSql().query<Video>('video').eq('is_deleted', 1).list();

  for (const video of deletedVideos) {
    await useSql().query<VideoActor>('video_actor').eq('video_id', video.id).delete();
    await useSql().query<VideoTag>('video_tag').eq('video_id', video.id).delete();
    await useSql().mapper<Video>('video').deleteById(video.id);
  }

  return deletedVideos.length;
}

export type VideoSortField = 'file_name'
  | 'file_size' | 'created_at' | 'updated_at' | 'duration_ms' | 'fps'
  | 'release_date'
  | 'file_birthtime';
export type SortOrder = 'ASC' | 'DESC';

export async function pageVideo(
  libraryId: string,
  page: number = 1,
  size: number = 20,
  order: VideoSortField = 'file_name',
  type: SortOrder = 'ASC'
) {
  return useSql().query<Video>('video')
    .eq('is_deleted', 0)
    .eq('library_id', libraryId)
    .order(order, type)
    .page(page, size);
}

export async function listAllVideo() {
  return await useSql().query<Video>('video').list();
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

export interface VideoMetadataForm extends VideoMetadata {
  actorIds: Array<VideoActorIdForm>;
  tagIds: Array<string>
}

export async function getVideoMetadataById(id: string): Promise<VideoMetadataForm | undefined> {
  const video = await useSql().query<Video>('video')
    .eq('id', id)
    .eq('is_deleted', 0)
    .get();
  if (!video) return undefined;
  const [tags, actors] = await Promise.all([
    useSql().query<VideoTag>('video_tag').eq('video_id', id).select('tag_id').list(),
    useSql().query<VideoActor>('video_actor').eq('video_id', id).select('actor_id', 'role_name').list()
  ])
  return {
    title: video.title,
    description: video.description,
    link: video.link,
    release_date: video.release_date,
    director: video.director,
    studio_id: video.studio_id,
    actorIds: actors.map(it => ({id: it.actor_id, role_name: it.role_name})),
    tagIds: tags.map(it => it.tag_id)
  }
}
