// src/services/jellyfin/utils.ts

import type {MediaItemJellyfin} from '@/module/media/types/media/MediaItem.jellyfin';
import type {MediaPersonJellyfin} from '@/module/media/types/person/MediaPerson.jellyfin';
import type {MediaDetail, MediaSource, MediaStream} from "@/module/media/types/detail/MediaDetail.ts";
import type {MediaPerson} from "@/module/media/types/person/MediaPerson.ts";

/**
 * 将 Jellyfin API 返回的 Item 转换为 MediaItemJellyfin
 */
export function normalizeMediaItem(item: any): MediaItemJellyfin {
  const typeMap: Record<string, MediaItemJellyfin['type']> = {
    Movie: 'Movie',
    Series: 'Series',
    Season: 'Season',
    Episode: 'Episode',
    Person: 'Person',
    CollectionFolder: 'Folder',
    Folder: 'Folder',
  };

  return {
    id: item.Id,
    name: item.Name || '',
    type: typeMap[item.Type] || 'Folder',
    year: item.ProductionYear,
    posterUrl: item.ImageTags?.Primary
      ? `${item.ServerUrl}/Items/${item.Id}/Images/Primary?tag=${item.ImageTags.Primary}`
      : undefined,
    backdropUrl: item.ImageTags?.Backdrop
      ? `${item.ServerUrl}/Items/${item.Id}/Images/Backdrop?tag=${item.ImageTags.Backdrop}`
      : item.ImageTags?.Primary
        ? `${item.ServerUrl}/Items/${item.Id}/Images/Primary?tag=${item.ImageTags.Primary}`
        : undefined,
    overview: item.Overview,
    rating: item.CommunityRating,
    runtimeSeconds: item.RunTimeTicks ? Math.floor(item.RunTimeTicks / 10_000_000) : undefined,
    genres: item.GenreItems?.map((g: any) => g.Name) || [],
    dateCreated: item.DateCreated,
    dateModified: item.DateLastSaved || item.DateCreated,
    parentId: item.ParentId,
    isFolder: item.IsFolder,
    childCount: item.ChildCount,
    recursiveItemCount: item.RecursiveItemCount,
    indexNumber: item.IndexNumber,
    parentIndexNumber: item.ParentIndexNumber,
    seriesId: item.SeriesId,
    seasonId: item.SeasonId,
    providerIds: item.ProviderIds,
    userData: item.UserData,
    officialRating: item.OfficialRating,
    path: item.Path,
    extra: item,
  };
}

/**
 * 将 Jellyfin 的 Person 转换为 PersonJellyfin
 */
export function normalizePerson(person: any, serverUrl: string): MediaPersonJellyfin {
  return {
    id: person.Id,
    name: person.Name,
    type: 'Actor', // Jellyfin 不直接返回角色类型，前端可从关联项推断
    role: person.Role, // 如果有
    imageUrl: person.PrimaryImageTag
      ? `${serverUrl}/Items/${person.Id}/Images/Primary?tag=${person.PrimaryImageTag}`
      : undefined,
    birthYear: person.BirthYear,
    deathYear: person.EndYear,
    biography: person.Overview,
    movieCount: person.MovieCount,
    seriesCount: person.SeriesCount,
    primaryImageTag: person.PrimaryImageTag,
    extra: person,
  };
}

export function mapItemType(type: string): MediaDetail['type'] {
  const map: Record<string, MediaDetail['type']> = {
    Movie: 'Movie',
    Series: 'Series',
    Season: 'Season',
    Episode: 'Episode',
    Person: 'Person',
    CollectionFolder: 'Collection',
    Folder: 'Folder',
  };
  return map[type] || 'Folder';
}

export function mapPersonType(type: string): MediaPerson['type'] {
  // Jellyfin: Actor, Director, Writer, Producer, GuestStar
  if (['Actor', 'GuestStar'].includes(type)) return 'Actor';
  if (type === 'Director') return 'Director';
  if (type === 'Writer') return 'Writer';
  if (type === 'Producer') return 'Producer';
  return 'Actor'; // fallback
}

export function buildBackdropUrls(baseUrl: string, itemId: string, tags?: string[]): string[] {
  if (!tags || !Array.isArray(tags)) return [];
  return tags.map((tag, index) =>
    `${baseUrl}/Items/${itemId}/Images/Backdrop/${index}?tag=${tag}`
  );
}

export function mapMediaSource(baseUrl: string, source: any): MediaSource {
  const videoStreams: MediaStream[] = [];
  const audioStreams: MediaStream[] = [];
  const subtitleStreams: MediaStream[] = [];

  for (const stream of source.MediaStreams || []) {
    const common: Omit<MediaStream, 'type'> = {
      id: stream.Index.toString(),
      codec: stream.Codec || '',
      language: stream.Language,
      title: stream.DisplayTitle || stream.Title,
      isDefault: stream.IsDefault,
      isForced: stream.IsForced,
      isExternal: stream.IsExternal,
      deliveryUrl: stream.DeliveryUrl ? `${baseUrl}${stream.DeliveryUrl}` : undefined,
      // 添加更多媒体流详细信息
      bitrate: stream.BitRate,
      profile: stream.Profile,
      level: stream.Level,
      pixelFormat: stream.PixelFormat,
      aspectRatio: stream.AspectRatio,
      width: stream.Width,
      height: stream.Height,
      channels: stream.Channels,
      sampleRate: stream.SampleRate,
      averageFrameRate: stream.AverageFrameRate,
      realFrameRate: stream.RealFrameRate,
      isAnamorphic: stream.IsAnamorphic,
      isInterlaced: stream.IsInterlaced,
      videoRange: stream.VideoRange,
      colorSpace: stream.ColorSpace,
      colorTransfer: stream.ColorTransfer,
      colorPrimaries: stream.ColorPrimaries,
    };

    if (stream.Type === 'Video') {
      videoStreams.push({...common, type: 'Video'});
    } else if (stream.Type === 'Audio') {
      audioStreams.push({...common, type: 'Audio'});
    } else if (stream.Type === 'Subtitle') {
      subtitleStreams.push({...common, type: 'Subtitle'});
    }
  }

  return {
    id: source.Id || source.Index?.toString() || 'default',
    container: source.Container || '',
    sizeBytes: source.Size,
    name: source.Name || '', // 媒体源名称
    path: source.Path || '', // 文件路径
    protocol: source.Protocol || '', // 协议（File, Http等）
    runTimeTicks: source.RunTimeTicks, // 时长（ticks）
    timestamp: source.Timestamp || '', // 时间戳
    videoRange: source.VideoRange || '', // 视频范围（SDR/HDR）
    videoType: source.VideoType || '', // 视频类型
    isRemote: source.IsRemote || false, // 是否远程
    etag: source.ETag || '', // ETag
    readAtNativeFramerate: source.ReadAtNativeFramerate || false,
    ignoreDts: source.IgnoreDts || false,
    ignoreIndex: source.IgnoreIndex || false,
    genPtsInput: source.GenPtsInput || false,
    supportsTranscoding: source.SupportsTranscoding || false,
    supportsDirectStream: source.SupportsDirectStream || false,
    supportsDirectPlay: source.SupportsDirectPlay || false,
    isInfiniteStream: source.IsInfiniteStream || false,
    requiresOpening: source.RequiresOpening || false,
    openToken: source.OpenToken || '',
    requiresClosing: source.RequiresClosing || false,
    liveStreamId: source.LiveStreamId || '',
    bufferMs: source.BufferMs || 0,
    requiresLooping: source.RequiresLooping || false,
    supportsProbing: source.SupportsProbing || false,
    videoStreams,
    audioStreams,
    subtitleStreams,
    defaultAudioIndex: source.DefaultAudioStreamIndex,
    defaultSubtitleIndex: source.DefaultSubtitleStreamIndex,
  };
}

// src/services/jellyfin/utils.ts
export function normalizeImageUrl(
  baseUrl: string,
  itemId: string,
  imageType: string,
  tag?: string
): string | undefined {
  if (!tag) return undefined;
  return `${baseUrl}/Items/${itemId}/Images/${imageType}?tag=${tag}`;
}
