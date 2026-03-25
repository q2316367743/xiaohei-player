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
import {listActorView, saveOrUpdateActor, saveVideoActor} from "@/service/video/ActorService.ts";
import {listTagView, saveOrUpdateTag, saveVideoTag} from "@/service/video/TagService.ts";
import {getStudio, saveOrUpdateStudio} from "@/service/video/StudioService.ts";
import {useSnowflake} from "@/util";
import type {Marker} from "@/entity/domain/Marker.ts";
import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {PageResponse, YesOrNo} from "@/global/CommonType.ts";


export async function saveVideo(form: VideoAddForm, hash: string) {
  const now = Date.now();
  const {actors, tags, studio, ...video} = form;

  // 先处理工作室
  const studio_id = await saveOrUpdateStudio(form.library_id, studio);
  // 处理演员
  await saveOrUpdateActor(actors, hash, form.library_id);
  // 处理标签
  await saveOrUpdateTag(tags, hash, form.library_id);

  await useSql().mapper<Video>('video').insertSelf({
    ...video,
    studio_id,
    caption: form.caption ? JSON.stringify(form.caption) : '[]',
    id: hash,
    created_at: now,
    updated_at: now,
    // 状态信息
    last_played_at: 0,
    play_count: 0,
    is_deleted: '0',
    is_liked: 0
  });
}

export async function updateVideo(id: string, form: Partial<VideoAddForm>) {
  const now = Date.now();
  const {actors, tags, studio, ...video} = form;

  // 获取旧的
  const old = await getVideoById(id);
  if (!old) return Promise.reject("视频不存在");

  // 先处理工作室
  const studio_id = await saveOrUpdateStudio(old.library_id, studio);
  // 处理演员
  if (actors) await saveOrUpdateActor(actors, id, old.library_id);
  // 处理标签
  if (tags) await saveOrUpdateTag(tags, id, old.library_id);

  await useSql().mapper<Video>('video').updateById(id, {
    ...video,
    caption: form.caption ? JSON.stringify(form.caption) : undefined,
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

// 物理删除
export async function deleteVideoPhysical(id: string) {
  await useSql().query<Video>('video').eq('id', id).delete();
}


export async function cleanDeletedVideo() {
  const deletedVideos = await useSql().query<Video>('video').ne('is_deleted', '0').list();

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

export interface VideoPageResult extends BaseEntity {
  file_size: number;        // 文件大小 (字节)
  file_birthtime: number;   // 文件创建时间

  cover_path: string;       // 封面文件路径
  screenshot_path: string;  // 预览视频文件路径

  title: string;            // 视频标题 (可手动覆盖)
  duration_ms: number;      // 视频时长

  last_played_at: number;   // 最后播放时间
  play_count: number;       // 播放次数
  resume_time: number;      // 恢复播放时间
  is_deleted: string;       // 软删除标记 (0:正常, 1:已删除)
  is_liked: YesOrNo;        // 是否喜欢

}

export async function pageVideo(
  libraryId: string,
  page: number = 1,
  size: number = 20,
  order: VideoSortField = 'file_name',
  type: SortOrder = 'ASC'
): Promise<PageResponse<VideoPageResult>> {
  return useSql().query<Video>('video')
    .select('id', 'created_at', 'updated_at', 'file_size', 'file_birthtime', 'cover_path', 'screenshot_path',
      'title', 'duration_ms', 'last_played_at', 'play_count', 'resume_time', 'is_deleted', 'is_liked')
    .eq('is_deleted', '0')
    .eq('library_id', libraryId)
    .order(order, type)
    .page(page, size);
}

export async function listAllVideoId() {
  return await useSql().query<Video>('video').select('id').list();
}

export async function listVideoFile() {
  return await useSql().query<Video>('video')
    .select('file_name', 'file_path', 'id')
    .eq('is_deleted', '0').list();
}

/**
 * 获取视频信息
 * @param id 视频ID
 */
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

/**
 * 获取视频元数据
 * @param id 视频ID
 */
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

/**
 * 获取视频详细信息
 * @param id
 */
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
    // JSON 解析字幕
    caption: video.caption ? JSON.parse(video.caption) : [],
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

export interface VideoStatisticsOverview {
  total_videos: number;
  total_size: number;
  total_duration: number;
  liked_videos: number;
  total_actors: number;
  total_tags: number;
  total_studios: number;
  total_libraries: number;
}

export async function getVideoStatisticsOverview(): Promise<VideoStatisticsOverview> {
  const [videoStats, actorCount, tagCount, studioCount, libraryCount] = await Promise.all([
    useSql().select<Array<{ count: number; size: number; duration: number; liked: number }>>(`
      SELECT 
        COUNT(*) as count, 
        COALESCE(SUM(file_size), 0) as size, 
        COALESCE(SUM(duration_ms), 0) as duration,
        COALESCE(SUM(CASE WHEN is_liked = 1 THEN 1 ELSE 0 END), 0) as liked
      FROM video 
      WHERE is_deleted = '0'
    `),
    useSql().select<Array<{ count: number }>>(`SELECT COUNT(*) as count FROM actor`),
    useSql().select<Array<{ count: number }>>(`SELECT COUNT(*) as count FROM tag`),
    useSql().select<Array<{ count: number }>>(`SELECT COUNT(*) as count FROM studio`),
    useSql().select<Array<{ count: number }>>(`SELECT COUNT(*) as count FROM library`)
  ]);

  return {
    total_videos: videoStats[0]?.count || 0,
    total_size: videoStats[0]?.size || 0,
    total_duration: videoStats[0]?.duration || 0,
    liked_videos: videoStats[0]?.liked || 0,
    total_actors: actorCount[0]?.count || 0,
    total_tags: tagCount[0]?.count || 0,
    total_studios: studioCount[0]?.count || 0,
    total_libraries: libraryCount[0]?.count || 0
  };
}