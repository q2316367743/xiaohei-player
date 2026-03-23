export interface TaskSetting {
  // =============
  // ==== 扫描 ====
  // =============

  // 重新扫描文件（如果关闭，如果存在文件，则会跳过）
  reScanFile: boolean;

  // 线程数
  threadNum: number;

  // =============
  // ==== 生成 ====
  // =============

  // 预览（预览视频）
  preview: boolean;
  // 短视频时间轴预览小图（9x9的切图）
  timelinePreviewThumbnail: boolean;
  // 标记预览（标记时生成 2s 的预览）
  markPreview: boolean;
  // 标记的屏幕截图（标记时的截图）
  markScreenshot: boolean;
  // 覆盖现有文件（开启后，生成的图片会覆盖）
  overwriteExistingFile: boolean;
}

export function getTaskSetting(): TaskSetting {
  return {
    reScanFile: false,
    threadNum: 3,
    preview: true,
    timelinePreviewThumbnail: true,
    markPreview: true,
    markScreenshot: true,
    overwriteExistingFile: false
  }
}