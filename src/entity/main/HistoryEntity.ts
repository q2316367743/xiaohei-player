import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface HistoryAddForm {

  path: string;

  type: 'file' | 'url';

  title: string;
}

export interface HistoryUpdateForm {

  /**
   * 播放进度
   */
  progress_second: number;
}

export interface HistoryEntity extends BaseEntity {

  path: string;

  type: 'file' | 'url';

  title: string;

  /**
   * 最后播放时间
   */
  last_played_time: number;

  /**
   * 播放进度
   */
  progress_second: number;

}