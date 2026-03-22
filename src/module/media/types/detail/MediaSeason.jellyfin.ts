import type {MediaSeason, MediaSeasonItem, MediaSeasonUserData} from "@/module/media/types/detail/MediaSeason.ts";

export interface MediaSeasonJellyfin extends MediaSeason{
  /**
   * 季列表项
   */
  items: Array<MediaSeasonItemJellyfin>;
  
}

/**
 * 媒体季项接口
 */
export interface MediaSeasonItemJellyfin extends MediaSeasonItem{
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
  userData: MediaSeasonUserDataJellyfin;
  
  /**
   * 图片标签
   */
  imageTags: Record<string, string>;
  
  /**
   * 图片模糊哈希值
   */
  imageBlurHashes: Record<string, string>;
  
  /**
   * 位置类型
   */
  locationType: string;
  
  /**
   * 媒体类型
   */
  mediaType: string;
}


/**
 * 用户数据接口
 */
interface MediaSeasonUserDataJellyfin extends MediaSeasonUserData{

  /**
   * 播放位置刻度
   */
  playbackPositionTicks: number;
  

  /**
   * 键值
   */
  key: string;
}