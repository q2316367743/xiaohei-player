import type { BaseEntity } from "../BaseEntity";

export interface DailyStatistics extends BaseEntity {
  date: string;            // 日期 YYYY-MM-DD
  play_count: number;      // 播放次数
  play_duration: number;   // 播放总时长(ms)
  videos_added: number;    // 新增视频数
  videos_completed: number; // 完成观看数
}
