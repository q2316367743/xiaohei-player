import type {MediaEpisode, MediaEpisodeItem, MediaEpisodeUserData} from "@/module/media/types/detail/MediaEpisode.ts";

export interface MediaEpisodeJellyfin extends MediaEpisode{
  /**
   * 剧集列表项
   */
  items: MediaEpisodeItemJellyfin[];
  
}

/**
 * 媒体剧集项接口
 */
export interface MediaEpisodeItemJellyfin extends MediaEpisodeItem{

  /**
   * 服务器ID
   */
  serverId: string;
  
  /**
   * 是否可删除
   */
  canDelete: boolean;
  
  /**
   * 频道ID
   */
  channelId?: any;

  /**
   * 用户数据
   */
  userData: MediaEpisodeUserDataJellyfin;
  
  /**
   * 视频类型
   */
  videoType: string;
  
  /**
   * 图片标签
   */
  imageTags: ImageTags;
  
  /**
   * 图片模糊哈希值
   */
  imageBlurHashes: ImageBlurHashes;
  
  /**
   * 位置类型
   */
  locationType: string;
  
  /**
   * 媒体类型
   */
  mediaType: string;
  
  /**
   * 主图片宽高比
   */
  primaryImageAspectRatio?: PrimaryImageAspectRatio | number;
}

/**
 * 主图片宽高比接口
 */
interface PrimaryImageAspectRatio {
  /**
   * 宽度比例
   */
  s: number;
  
  /**
   * 高度比例
   */
  e: number;
  
  /**
   * 比例系数数组
   */
  c: number[];
}

/**
 * 图片模糊哈希值接口
 */
interface ImageBlurHashes {
  /**
   * 主图片模糊哈希值
   */
  primary?: Record<string, string>;
}

/**
 * 图片标签接口
 */
interface ImageTags {
  /**
   * 主图片标签
   */
  primary?: string;
}

/**
 * 用户数据接口
 */
interface MediaEpisodeUserDataJellyfin extends MediaEpisodeUserData{

  /**
   * 键值
   */
  key: string;
}