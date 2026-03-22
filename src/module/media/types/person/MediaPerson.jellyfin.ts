import type {MediaPerson} from "@/module/media/types/person/MediaPerson.ts";

export interface MediaPersonJellyfin extends MediaPerson {

  primaryImageTag?: string;     // 图片缓存 tag（用于拼 URL）
  endDate?: string;             // 活跃结束年
  movieCount?: number;
  seriesCount?: number;
}