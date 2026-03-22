import type {MediaPlaybackInfo} from "@/module/media/types/playback/MediaPlaybackInfo.ts";

export interface MediaPlaybackInfoPlex extends MediaPlaybackInfo {
  // Plex 特有
  plexDirectPlay?: boolean;     // 是否 Plex Direct
  transcodeKey?: string;        // 转码会话 key（如 "/transcode/sessions/abc123"）
  qualityProfile?: string;      // "1080p", "4k"
  userAgent?: string;           // 模拟 Plex 客户端 UA
}