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
  // 视频是否自动播放
  videoAutoPlay: boolean;
}

export function getInterfaceSetting(): InterfaceSetting {
  return {
    showPreviewAxis: true,
    videoFromStart: false,
    videoAutoPlay: false,
  }
}