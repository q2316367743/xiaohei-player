import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface VideoCore {
  file_path: string;        // 当前绝对文件路径
  screenshot_path: string;  // 预览视频文件路径
  sprite_path: string;      // 分割文件路径
  vtt_path: string;         // vtt文件路径
  file_name: string;        // 文件名 (带扩展名)
  file_size: number;        // 文件大小 (字节)
  duration_ms: number;      // 视频时长 (毫秒)
  width: number;            // 分辨率宽
  height: number;           // 分辨率高
  container_format: string; // 容器格式 (mp4, mkv, avi...)
  video_codec: string;      // 视频编码 (h264, hevc...)
  audio_codec: string;      // 音频编码 (aac, mp3...)

  // 用户可编辑的元数据
  title: string;            // 视频标题 (可手动覆盖)
  description: string;      // 描述
  release_date: string;     // 发行日期
  last_played_at: number;   // 最后播放时间
  play_count: number;       // 播放次数

  // 状态标记
  is_deleted: number;       // 软删除标记 (0:正常, 1:已删除)
  scan_status: string;      // 扫描状态: 'pending', 'scanning', 'completed', 'error'
  error_message: string;    // 扫描或处理错误信息
}

export interface Video extends BaseEntity, VideoCore {
}