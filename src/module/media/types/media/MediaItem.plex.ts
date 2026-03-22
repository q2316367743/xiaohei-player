import type {MediaItem} from "@/module/media/types/media/MediaItem.ts";

/**
 * Plex 特有扩展字段
 * 参考：https://plex.tv/api/resources
 */
export interface MediaItemPlex extends MediaItem {

  // Plex 特有
  key: string;                    // 内部路径，如 "/library/metadata/12345"
  guid: string;                   // 如 "com.plexapp.agents.tmdb://12345"
  index?: number;                 // 集号（Episode）或季号（Season）
  parentIndex?: number;           // 季号（Episode）
  addedAt: number;                // Unix timestamp（秒）
  updatedAt: number;              // Unix timestamp（秒）
  leafCount?: number;             // 总集数（Series）
  viewedLeafCount?: number;       // 已看集数
  duration: number;               // 时长（毫秒）
  originallyAvailableAt?: string; // 首播日期 "2020-01-01"
  Media?: Array<{
    id: string;
    videoResolution: string;      // "1080", "4k"
    audioChannels: number;
    container: string;            // "mkv", "mp4"
    Part: Array<{
      id: string;
      file: string;               // 本地路径（若客户端有权访问）
    }>;
  }>;

  // 用户观看状态（需通过 /status/sessions 或 metadata 获取）
  viewOffset?: number;            // 播放进度（毫秒）
  viewCount?: number;
}