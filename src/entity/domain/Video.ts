import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {YesOrNo} from "@/global/CommonType.ts";

export interface VideoOriginalFile {
  file_path: string;        // 当前绝对文件路径
  file_name: string;        // 文件名 (带扩展名)
  file_size: number;        // 文件大小 (字节)
  file_birthtime: number;   // 文件创建时间
  hidden: YesOrNo;          // 隐藏标记 (0:正常, 1:隐藏)
}

export interface VideoGenerateFile {
  screenshot_path: string;  // 预览视频文件路径
  sprite_path: string;      // 分割文件路径
  vtt_path: string;         // vtt文件路径
  cover_path: string;       // 封面文件路径
}

// 文件信息
export interface VideoFile extends VideoOriginalFile, VideoGenerateFile {
}

// 视频信息
export interface VideoInfo {
  duration_ms: number;      // 视频时长
  width: number;            // 分辨率宽
  height: number;           // 分辨率高
  fps: number;              // 帧率
  bit_rate: number;         // 比特率
  video_codec: string;      // 视频编码 (h264, hevc...)
  audio_codec: string;      // 音频编码 (aac, mp3...)
  container_format: string; // 容器格式 (mp4, mkv, avi...)
}

// 用户可编辑的元数据
export interface VideoMetadata {
  title: string;            // 视频标题 (可手动覆盖)
  description: string;      // 描述
  link: string;             // 视频原始链接
  release_date: string;     // 发行日期
  director: string;         // 导演
  studio_id: string;        // 工作室
}

// 状态标记
export interface VideoStatusInfo {
  last_played_at: number;   // 最后播放时间
  play_count: number;       // 播放次数
  is_deleted: number;       // 软删除标记 (0:正常, 1:已删除)
  scan_status: string;      // 扫描状态: 'pending', 'scanning', 'completed', 'error'
  error_message: string;    // 扫描或处理错误信息
}

export interface VideoCore extends VideoFile, VideoInfo, VideoMetadata, VideoStatusInfo {

}

export interface Video extends BaseEntity, VideoCore {
}

export interface VideoEdit {
  // 演员, 角色
  actors: Array<{ name: string, role: string }>;
  // 标签
  tags: Array<string>;
  studio: string;
}

export interface VideoAddForm extends VideoOriginalFile, VideoInfo, VideoMetadata, VideoEdit {
  screenshot_path?: string;  // 预览视频文件路径
  sprite_path?: string;      // 分割文件路径
  vtt_path?: string;         // vtt文件路径
  cover_path?: string;       // 封面文件路径
}