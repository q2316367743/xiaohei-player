import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface HistoryEntry extends BaseEntity {

  path: string;

  type: string;

  title: string;

  cover: string;    // 是否有意义

  /**
   * 最后播放时间
   */
  last_played_time: number;

  /**
   * 播放进度
   */
  progress_second: number;

}