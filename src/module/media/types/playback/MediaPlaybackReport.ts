// playback-reporter.interface.ts

export type MediaPlaybackState = 'playing' | 'paused' | 'stopped';

export interface MediaPlaybackReport {
  /**
   * 媒体项 ID（Movie 或 Episode）
   */
  itemId: string;

  /**
   * 当前播放位置（毫秒）
   */
  positionMs: number;

  /**
   * 媒体总时长（毫秒，可选）
   */
  durationMs?: number;

  /**
   * 播放状态
   */
  state: MediaPlaybackState;

  /**
   * （可选）播放开始时间的时间戳（用于 Jellyfin 的 PlaybackStartTimeTicks）
   */
  playbackStartTime?: number; // Unix timestamp in ms
}
