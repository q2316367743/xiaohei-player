import type {MediaPlaybackInfo} from "@/module/media/types/playback/MediaPlaybackInfo.ts";

export interface MediaPlaybackInfoJellyfin extends MediaPlaybackInfo {
  // Jellyfin 特有
  mediaSourceId: string;        // 媒体源 ID
  deviceId: string;             // 设备 ID（用于会话管理）
  accessToken: string;          // 临时 token（若需要）
  playSessionId: string;        // 播放会话 ID（上报进度用）
}