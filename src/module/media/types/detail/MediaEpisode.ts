/**
 * 剧集列表响应（通用）
 */
export interface MediaEpisode {
  /**
   * 剧集项列表
   */
  items: MediaEpisodeItem[];

  /**
   * 总集数（可选，Plex 可能需计算）
   */
  totalRecordCount?: number;

  /**
   * 起始索引（分页用，可选）
   */
  startIndex?: number;
}

/**
 * 通用剧集项（一集的信息）
 */
export interface MediaEpisodeItem {
  /**
   * 剧集唯一 ID
   * - Jellyfin/Emby: Id
   * - Plex: ratingKey
   */
  id: string;

  /**
   * 剧集标题（如 "The Pilot"）
   */
  name: string;

  /**
   * 所属季 ID
   * - Jellyfin/Emby: ParentId 或 SeasonId
   * - Plex: parentRatingKey
   */
  seasonId: string;

  /**
   * 所属季名称（如 "Season 1"）
   */
  seasonName: string;

  /**
   * 所属剧集（Series）ID
   */
  seriesId: string;

  /**
   * 所属剧集名称
   */
  seriesName: string;

  /**
   * 集序号（E01 → 1）
   */
  indexNumber?: number;

  /**
   * 季序号（S01 → 1）
   */
  parentIndexNumber?: number;

  /**
   * 运行时长（毫秒）← 统一单位！
   * - Jellyfin/Emby: runTimeTicks / 10_000
   * - Plex: duration（本身就是毫秒）
   */
  runtimeMs?: number;

  /**
   * 是否为文件夹（剧集应为 false）
   */
  isFolder: boolean;

  /**
   * 类型固定为 'Episode'
   */
  type: 'Episode';

  /**
   * 主海报图标识（用于构建图片 URL）
   * - Jellyfin/Emby: imageTags.primary
   * - Plex: thumb（适配器中可转为 tag 或特殊处理）
   */
  primaryImageTag?: string;

  /**
   * 背景图标识（可选）
   */
  backdropImageTag?: string;

  /**
   * 用户播放状态
   */
  userData?: MediaEpisodeUserData;

  /**
   * （可选）原始容器格式，如 "mkv", "mp4"
   * - Jellyfin/Emby: Container
   * - Plex: container（小写）
   */
  container?: string;

  /**
   * （可选）是否包含外部/嵌入字幕（布尔值足够）
   */
  hasSubtitles?: boolean;
}

/**
 * 用户播放状态（精简核心）
 */
export interface MediaEpisodeUserData {
  /**
   * 当前播放位置（毫秒）← 统一单位！
   */
  playbackPositionMs?: number;

  /**
   * 播放次数
   */
  playCount?: number;

  /**
   * 是否已播放完成
   */
  played?: boolean;

  /**
   * 是否被收藏/加星
   */
  isFavorite?: boolean;

  /**
   * 最后播放时间（ISO 8601 字符串，如 "2025-12-19T10:00:00Z"）
   */
  lastPlayedDate?: string;
}