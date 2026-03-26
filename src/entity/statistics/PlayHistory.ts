import type { BaseEntity } from "../BaseEntity";
import type {YesOrNo} from "@/global/CommonType.ts";

export interface PlayHistory extends BaseEntity {
  video_id: string;        // 视频ID
  library_id: string;      // 收藏库ID
  played_at: number;       // 播放时间戳
  duration_played: number; // 本次播放时长
  progress_percent: number; // 播放进度百分比
  completed: YesOrNo;       // 是否播放完成 0/1
}
