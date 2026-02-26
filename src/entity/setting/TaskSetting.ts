export interface TaskSetting {
  // =============
  // ==== 扫描 ====
  // =============

  // 生成短片封面
  generateShortCover: boolean;
  // 生成预览
  generatePreview: boolean;
  // 生成时间轴预览小图
  generateTimelinePreviewThumbnail: boolean;
  // 生成图片的缩略图
  generateImageThumbnail: boolean;
  // 为图像短片生成预览图
  generateShortCoverPreview: boolean;
  // 重新扫描文件
  reScanFile: boolean;

  // =============
  // ==== 生成 ====
  // =============

  // 短片封面
  shortCover: boolean;
  // 预览
  preview: boolean;
  // 短视频时间轴预览小图
  timelinePreviewThumbnail: boolean;
  // 标记预览
  markPreview: boolean;
  // 标记的屏幕截图
  markScreenshot: boolean;
  // 产生热图和速度资料给有互动的短片
  generateHeatmapAndSpeedData: boolean;
  // 图像片段预览
  imageSegmentPreview: boolean;
  // 图像缩略图
  imageThumbnail: boolean;
  // 覆盖现有文件
  overwriteExistingFile: boolean;
}

export function getTaskSetting(): TaskSetting {
  return {
    generateShortCover: false,
    generatePreview: false,
    generateTimelinePreviewThumbnail: false,
    generateImageThumbnail: false,
    generateShortCoverPreview: false,
    reScanFile: false,
    shortCover: false,
    preview: false,
    timelinePreviewThumbnail: false,
    markPreview: false,
    markScreenshot: false,
    generateHeatmapAndSpeedData: false,
    imageSegmentPreview: false,
    imageThumbnail: false,
    overwriteExistingFile: false
  }
}