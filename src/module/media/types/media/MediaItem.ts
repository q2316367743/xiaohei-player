/**
 * 通用媒体项基础接口
 * 所有平台必须能映射到此结构
 */
export interface MediaItem {
  /**
   * 媒体服务器内的唯一 ID
   * - Jellyfin/Emby: GUID string
   * - Plex: numeric string
   */
  id: string;

  /**
   * 标题
   */
  name: string;

  /**
   * 媒体类型
   */
  type: 'Movie' | 'Series' | 'Season' | 'Episode' | 'Person' | 'Collection' | 'Folder';

  /**
   * 上映/发布年份
   */
  year?: number;

  /**
   * 主海报图 URL（完整 HTTP(S) 地址）
   */
  posterUrl?: string;

  /**
   * 背景图 URL
   */
  backdropUrl?: string;

  /**
   * 简介
   */
  overview?: string;

  /**
   * 评分（0.0 ~ 10.0）
   */
  rating?: number;

  /**
   * 时长（秒），适用于 Movie / Episode
   */
  runtimeSeconds?: number;

  /**
   * 分类标签
   */
  genres?: string[];

  /**
   * 创建时间（ISO 8601）
   */
  dateCreated?: string;

  /**
   * 最后修改时间（ISO 8601）
   */
  dateModified?: string;

  /**
   * 父级 ID（用于构建层级）
   */
  parentId?: string;

  /**
   * 额外平台特有数据（兜底）
   */
  extra?: Record<string, unknown>;

  userData?: {
    playbackPositionTicks: number;  // 当前播放进度（100ns）
    playCount: number;
    lastPlayedDate?: string;
    played: boolean;
    isFavorite: boolean;
    rating?: number;                // 用户个人评分
  };
}