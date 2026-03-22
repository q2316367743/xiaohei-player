// types/media/MediaDetail.ts
import { type MediaItem } from '../media/MediaItem';
import type {MediaPerson} from "@/module/media/types/person/MediaPerson.ts";

/**
 * 通用媒体详情（跨 Jellyfin / Emby / Plex）
 * 字段设计原则：
 * - 优先取三者交集
 * - 差异字段用 optional + 语义对齐
 * - 无法对齐的放入 extra
 */
export interface MediaDetail extends MediaItem {
  // --- 增强基础信息 ---
  originalTitle?: string;        // 原名
  tagline?: string;              // 宣传语
  officialRating?: string;       // 分级（PG-13, TV-MA）
  studios?: string[];            // 制片公司
  productionLocations?: string[]; // 拍摄地

  // --- 多图支持（通用化）---
  backdropUrls?: string[];       // 多张背景图（轮播用）
  logoUrl?: string;              // Logo 图
  thumbUrl?: string;             // 缩略图
  artUrl?: string;               // 艺术图（Plex/Jellyfin 支持）
  
  // --- 新增图片类型 ---
  discUrl?: string;              // 光盘图
  menuUrl?: string;              // 菜单图
  screenshotUrl?: string;          // 截图
  chapterImageUrls?: string[];   // 章节图片
  boxUrl?: string;               // 封面图
  boxRearUrl?: string;           // 封底图
  profileUrl?: string;           // 个人资料图

  // --- 播放相关 ---
  runtimeSeconds?: number;       // 总时长（秒）
  chapters?: Array<{
    startSeconds: number;        // 章节起始（秒，统一单位！）
    title: string;
    thumbnailUrl?: string;
  }>;

  // --- 演职员（通用结构）---
  people?: Array<MediaPerson>;

  // --- 外部 ID（三者都支持 TMDb/IMDb）---
  externalIds?: {
    tmdb?: string;
    imdb?: string;
    tvdb?: string;
  };

  // --- 用户状态（观看进度、收藏等）---
  userState?: {
    played: boolean;
    playCount: number;
    lastPlayedAt?: string;     // ISO 8601
    playbackPositionSeconds?: number; // 当前进度（秒，统一！）
    isFavorite: boolean;
    personalRating?: number;   // 用户个人评分（0~10）
  };

  // --- 关联信息 ---
  seriesName?: string;         // 所属剧集名（Episode/Season 用）
  seasonName?: string;         // 所属季名
  indexNumber?: number;        // 集号
  parentIndexNumber?: number;  // 季号

  // --- 播放源（用于高级控制，如音轨切换）---
  mediaSources?: MediaSource[];

  // --- 兜底 ---
  extra?: Record<string, unknown>;
}

/**
 * 通用媒体源（简化版，隐藏平台差异）
 */
export interface MediaSource {
  id: string;
  container: string;           // "mp4", "mkv"
  sizeBytes?: number;
  name?: string;               // 媒体源名称
  path?: string;               // 文件路径
  protocol?: string;           // 协议（File, Http等）
  runTimeTicks?: number;     // 时长（ticks）
  timestamp?: string;          // 时间戳
  videoRange?: string;         // 视频范围（SDR/HDR）
  videoType?: string;          // 视频类型
  isRemote?: boolean;        // 是否远程
  etag?: string;               // ETag
  readAtNativeFramerate?: boolean;
  ignoreDts?: boolean;
  ignoreIndex?: boolean;
  genPtsInput?: boolean;
  supportsTranscoding?: boolean;
  supportsDirectStream?: boolean;
  supportsDirectPlay?: boolean;
  isInfiniteStream?: boolean;
  requiresOpening?: boolean;
  openToken?: string;
  requiresClosing?: boolean;
  liveStreamId?: string;
  bufferMs?: number;
  requiresLooping?: boolean;
  supportsProbing?: boolean;
  videoStreams: MediaStream[];
  audioStreams: MediaStream[];
  subtitleStreams: MediaStream[];
  defaultAudioIndex?: number;
  defaultSubtitleIndex?: number;
}

/**
 * 通用媒体流
 */
export interface MediaStream {
  id: string;                  // 自定义 ID（平台无关）
  type: 'Video' | 'Audio' | 'Subtitle';
  codec: string;               // "h264", "aac", "srt"
  language?: string;           // "eng", "chi", "jpn"
  title?: string;              // 显示名称（如 "Commentary"）
  isDefault?: boolean;
  isForced?: boolean;          // 强制字幕
  isExternal?: boolean;        // 外挂
  deliveryUrl?: string;        // 可直接下载的 URL（字幕用）
  // 添加更多详细信息
  bitrate?: number;            // 比特率
  profile?: string;            // 编码配置
  level?: number;              // 编码等级
  pixelFormat?: string;        // 像素格式
  aspectRatio?: string;        // 宽高比
  width?: number;              // 宽度
  height?: number;             // 高度
  channels?: number;           // 声道数
  sampleRate?: number;         // 采样率
  averageFrameRate?: number;   // 平均帧率
  realFrameRate?: number;      // 实际帧率
  isAnamorphic?: boolean;      // 是否变形
  isInterlaced?: boolean;      // 是否交错
  videoRange?: string;         // 视频范围（SDR/HDR）
  colorSpace?: string;         // 色彩空间
  colorTransfer?: string;      // 色彩转换
  colorPrimaries?: string;     // 色彩原色
}