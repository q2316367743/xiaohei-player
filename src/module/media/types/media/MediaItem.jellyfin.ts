import type {MediaItem} from "@/module/media/types/media/MediaItem.ts";

/**
 * Jellyfin 特有扩展字段
 * 参考：https://api.jellyfin.org/
 */
export interface MediaItemJellyfin extends MediaItem{
  // --- 基础信息 ---
  id: string;
  name: string;
  originalTitle?: string;
  type: 'Movie' | 'Series' | 'Season' | 'Episode' | 'Person' | 'Collection' | 'Folder';
  isFolder: boolean;
  year?: number;
  officialRating?: string;          // 分级（PG-13, R 等）
  communityRating?: number;         // 社区评分（0~10）
  criticRating?: number;            // 专业评分
  overview?: string;                // 完整剧情简介
  tagline?: string;                 // 宣传语（"In space no one can hear you scream."）
  genres?: string[];                // ["Action", "Sci-Fi"]
  tags?: string[];                  // 用户自定义标签
  studios?: Array<{ Name: string }>;
  productionLocations?: string[];   // 拍摄地

  // --- 时间与状态 ---
  dateCreated: string;              // ISO 8601
  dateModified: string;             // 最后修改
  premiereDate?: string;            // 首播日期（剧集）
  endDate?: string;                 // 结束日期（剧集完结）

  // --- 图片资源（全量）---
  imageTags?: {
    Primary?: string;               // 海报
    Art?: string;                   // 艺术图
    Backdrop?: string;              // 背景图（可多个）
    Logo?: string;
    Thumb?: string;
    Disc?: string;
    Banner?: string;
  };
  backdropCount?: number;           // 背景图数量（用于加载多张）
  posterUrl?: string;               // 已拼接好的海报 URL
  backdropUrls?: string[];          // 多张背景图 URL 列表（前端轮播用）

  // --- 播放相关 ---
  runtimeSeconds?: number;          // 总时长（秒）
  chapters?: Array<{
    startPositionTicks: number;     // 起始位置（100ns）
    name: string;
    imageUrl?: string;              // 章节缩略图
  }>;
  mediaSources?: MediaSourceJellyfin[]; // 所有可用播放源（本地文件、转码等）

  // --- 关联内容 ---
  parentId?: string;
  seriesId?: string;                // 所属剧集 ID（Episode/Season 用）
  seasonId?: string;                // 所属季 ID（Episode 用）
  indexNumber?: number;             // 集号（Episode）
  parentIndexNumber?: number;       // 季号（Episode）

  // --- 外部 ID ---
  providerIds?: {
    Tmdb?: string;
    Imdb?: string;
    Tvdb?: string;
    MusicBrainzAlbum?: string;
    MusicBrainzArtist?: string;
  };

  // --- 演职员（People）---
  people?: Array<{
    name: string;
    id: string;
    role?: string;                // 角色名（如 "Tony Stark"）
    type: 'Actor' | 'Director' | 'Writer' | 'Producer' | 'GuestStar';
    primaryImageTag?: string;     // 头像 tag
    imageUrl?: string;            // 已拼接头像 URL
  }>;

  // --- 其他 ---
  path?: string;                    // 本地文件路径（仅管理员可见）
  childCount?: number;              // 子项数量（Series 的季数，Season 的集数）
  recursiveItemCount?: number;      // 递归子项总数（电影合集等）

  // --- 兜底 ---
  extra?: Record<string, unknown>;  // 保留原始响应，应对私有字段
}

/**
 * Jellyfin 媒体源（一个视频可能有多个源，如不同分辨率/容器）
 */
export interface MediaSourceJellyfin {
  id: string;
  protocol: 'File' | 'Http' | 'Rtsp';
  container: string;               // "mkv", "mp4"
  size: number;                    // 字节
  videoStreams: MediaStreamJellyfin[];
  audioStreams: MediaStreamJellyfin[];
  subtitleStreams: MediaStreamJellyfin[];
  defaultAudioStreamIndex?: number;
  defaultSubtitleStreamIndex?: number;
  path?: string;                   // 本地路径
  requiresClosing: boolean;
  requiresOpening: boolean;
  supportsTranscoding: boolean;
  transcodingUrl?: string;         // 转码流地址
}

/**
 * 媒体流（音轨/字幕/视频轨）
 */
export interface MediaStreamJellyfin {
  index: number;
  type: 'Video' | 'Audio' | 'Subtitle';
  codec: string;                   // "h264", "aac", "srt"
  language?: string;               // "eng", "chi"
  title?: string;                  // "Commentary", "Forced"
  displayTitle?: string;           // "English (AAC Stereo)"
  isDefault?: boolean;
  isForced?: boolean;
  isExternal?: boolean;            // 外挂字幕
  deliveryUrl?: string;            // 字幕下载地址（如 /Videos/.../Subtitles/0.srt）
}