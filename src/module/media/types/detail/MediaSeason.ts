/**
 * 季列表响应（通用）
 */
export interface MediaSeason {
  /**
   * 季项列表（每项代表一季）
   */
  items: MediaSeasonItem[];

  /**
   * 总季数（可选，Plex 可能不直接提供）
   */
  totalRecordCount?: number;

  /**
   * 起始索引（分页用，可选）
   */
  startIndex?: number;
}

/**
 * 通用季项（一季的信息）
 */
export interface MediaSeasonItem {
  /**
   * 季的唯一 ID（Jellyfin/Emby: Id, Plex: ratingKey）
   */
  id: string;

  /**
   * 季名称（如 "Season 1", "特别篇"）
   */
  name: string;

  /**
   * 季序号（S01 → 1, S00 → 0）
   * 注意：Plex 中可能为 null（需从 parentIndex 推断）
   */
  indexNumber?: number;

  /**
   * 所属剧集（Series）的 ID
   */
  seriesId: string;

  /**
   * 所属剧集名称
   */
  seriesName: string;

  /**
   * 是否为文件夹容器（三端均为 true）
   */
  isFolder: boolean;

  /**
   * 类型标识（统一为 'Season'）
   */
  type: 'Season';

  /**
   * 主要海报图的标识（用于构建图片 URL）
   * - Jellyfin/Emby: imageTags.Primary
   * - Plex: thumb（需转换为 tag 形式或单独处理）
   */
  primaryImageTag?: string;

  /**
   * 背景图标识（可选）
   */
  backdropImageTag?: string;

  /**
   * 用户播放状态数据
   */
  userData?: MediaSeasonUserData;
}

/**
 * 用户播放状态（精简核心字段）
 */
export interface MediaSeasonUserData {
  /**
   * 该季中未播放的集数
   */
  unplayedItemCount?: number;

  /**
   * 是否已全部播放（可由 unplayedItemCount === 0 推导，但 Plex/Jellyfin 直接提供）
   */
  played?: boolean;

  /**
   * 是否被用户收藏/加星
   */
  isFavorite?: boolean;

  /**
   * 播放次数（整季维度，部分平台可能不提供）
   */
  playCount?: number;
}