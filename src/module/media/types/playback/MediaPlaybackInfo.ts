/**
 * 通用播放信息
 * 用于启动 MPV 或其他播放器
 */
export interface MediaPlaybackInfo {
  /**
   * 可直接播放的流地址（HTTP(S)）
   * 支持 direct stream / transcode stream
   */
  streamUrl: string;

  /**
   * 外挂字幕 URL 列表（SRT/VTT）
   */
  subtitleUrls?: string[];

  /**
   * 音轨列表
   */
  audioTracks?: Array<{
    id: string;
    title: string;            // 如 "English (AAC 5.1)"
    language?: string;        // "eng", "chi"
    isDefault?: boolean;
  }>;

  /**
   * 容器格式（mp4, mkv, m3u8 等）
   */
  container: string;

  /**
   * 是否为直通播放（无需转码）
   */
  isDirectPlay: boolean;

  /**
   * 转码会话 ID（用于后续控制，如 Jellyfin）
   */
  transcodingSessionId?: string;

  /**
   * 初始播放位置（毫秒）
   * 用于从上次播放位置继续播放
   */
  initialPositionMs?: number;

  /**
   * 额外参数（如 headers、cookies）
   */
  extra?: {
    headers?: Record<string, string>;
    cookies?: string;
  };
}