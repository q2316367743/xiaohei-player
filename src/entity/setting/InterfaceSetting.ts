export interface InterfaceSetting {

  // 短片播放器

  /**
   * 显示预览轴
   */
  showPreviewAxis: boolean;
  /**
   * 视频一定从头开始播放
   */
  videoFromStart: boolean;
  /**
   * 启用短片播放历史记录
   */
  enableShortVideoHistory: boolean;
}

export function getInterfaceSetting(): InterfaceSetting {
  return {
    showPreviewAxis: true,
    videoFromStart: false,
    enableShortVideoHistory: true
  }
}