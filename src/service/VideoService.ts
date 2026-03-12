import {useSql} from "@/lib/sql.ts";
import type {
  Video,
  VideoActorIdForm,
  VideoAddForm,
  VideoMetadata,
  VideoStatusInfo, VideoView
} from "@/entity/domain/Video.ts";
import type {VideoActor} from "@/entity/domain/VideoActor.ts";
import type {VideoTag} from "@/entity/domain/VideoTag.ts";
import {listActorView, saveOrUpdateActor, saveVideoActor} from "@/service/ActorService.ts";
import {listTagView, saveOrUpdateTag, saveVideoTag} from "@/service/TagService.ts";
import {getStudio, saveOrUpdateStudio} from "@/service/StudioService.ts";
import {useSnowflake} from "@/util";
import type {Marker} from "@/entity/domain/Marker.ts";


export async function saveVideo(form: VideoAddForm, hash: string) {
  const now = Date.now();
  const {actors, tags, studio, ...video} = form;

  // 先处理工作室
  const studio_id = await saveOrUpdateStudio(studio, form.library_id);
  // 处理演员
  await saveOrUpdateActor(actors, hash, form.library_id);
  // 处理标签
  await saveOrUpdateTag(tags, hash, form.library_id);

  await useSql().mapper<Video>('video').insertSelf({
    ...video,
    studio_id,
    id: hash,
    created_at: now,
    updated_at: now,
    // 状态信息
    last_played_at: 0,
    play_count: 0,
    is_deleted: '0',
    scan_status: 'completed',
    error_message: '',
  });
}

export async function updateVideo(id: string, form: Partial<VideoAddForm>) {
  const now = Date.now();
  const {actors, tags, studio, ...video} = form;

  // 获取旧的
  const old = await getVideoById(id);
  if (!old) return Promise.reject("视频不存在");

  let studio_id: string | undefined = undefined;
  // 先处理工作室
  if (studio) {
    studio_id = await saveOrUpdateStudio(studio, old.library_id);
  }
  // 处理演员
  if (actors) await saveOrUpdateActor(actors, id, old.library_id);
  // 处理标签
  if (tags) await saveOrUpdateTag(tags, id, old.library_id);

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
  // 非 0 则是删除
  await useSql().mapper<Video>('video').updateById(id, {is_deleted: useSnowflake().nextId()});
}

export async function cleanDeletedVideo() {
  const deletedVideos = await useSql().query<Video>('video').ne('is_deleted', '').list();

  for (const video of deletedVideos) {
    await useSql().query<VideoActor>('video_actor').eq('video_id', video.id).delete();
    await useSql().query<VideoTag>('video_tag').eq('video_id', video.id).delete();
    await useSql().mapper<Video>('video').deleteById(video.id);
    await useSql().mapper<Marker>('marker').deleteById(video.id);
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
    .eq('is_deleted', '0')
    .eq('library_id', libraryId)
    .order(order, type)
    .page(page, size);
}

export async function listAllVideo() {
  return await useSql().query<Video>('video').list();
}

export async function listVideo() {
  return await useSql().query<Video>('video').eq('is_deleted', '0').list();
}

export async function getVideoById(id: string) {
  return useSql().query<Video>('video')
    .eq('id', id)
    .eq('is_deleted', '0')
    .get();
}

export interface VideoMetadataForm extends VideoMetadata {
  actorIds: Array<VideoActorIdForm>;
  tagIds: Array<string>
}

interface VideoMetadataFormWrap extends VideoMetadataForm {
  library_id: string
}

export async function getVideoMetadataById(id: string): Promise<VideoMetadataFormWrap | undefined> {
  const video = await useSql().query<Video>('video')
    .eq('id', id)
    .eq('is_deleted', '0')
    .get();
  if (!video) return undefined;
  const [tags, actors] = await Promise.all([
    useSql().query<VideoTag>('video_tag').eq('video_id', id).list(),
    useSql().query<VideoActor>('video_actor').eq('video_id', id).list()
  ])
  return {
    title: video.title,
    description: video.description,
    link: video.link,
    release_date: video.release_date,
    director: video.director,
    studio_id: video.studio_id,
    library_id: video.library_id,
    actorIds: actors.map(it => ({id: it.actor_id, role_name: it.role_name})),
    tagIds: tags.map(it => it.tag_id)
  }
}

export async function getVideoInfoById(id: string): Promise<VideoView | undefined> {
  const video = await getVideoById(id);
  if (!video) return undefined;
  // 获取关联信息
  const [actors, tags, studio] = await Promise.all([
    listActorView(id),
    listTagView(id),
    getStudio(video.studio_id)
  ]);

  return {
    ...video,
    actors,
    tags,
    studio
  };
}

/**
 * 列出最近播放的 10 个视频
 */
export async function listLastPlayedVideo() {
  return useSql().select<Array<Video>>(`
      select v.*
      from video v
               left join library l on v.library_id = l.id
      where v.is_deleted = '0'
        and l.password = ''
        and v.last_played_at > 0
      order by v.last_played_at desc
      limit 10`)
}

export async function listLastAddVideo() {
  return useSql().select<Array<Video>>(`
      select v.*
      from video v
               left join library l on v.library_id = l.id
      where v.is_deleted = '0'
        and l.password = ''
      order by v.created_at desc
      limit 10`)
}