export interface LibraryItem {
  // 名称
  name: string;
  // 路径
  path: string;
  // 是否隐藏
  hidden: boolean;
}

export interface LibrarySetting {

  // 收藏库列表
  items: Array<LibraryItem>;

  // 扫描视频拓展名
  scanExtname: Array<string>;
  // 打开视频拓展名
  openExtname: Array<string>;

  // 视频排除规则
  videoExclude: Array<string>;
  // 图片/图库排除规则
  imageExclude: Array<string>;

  // 从包含图片的文件夹建立图库
  imageFromImageFolder: boolean;
  // 写图片缩略
  writeImageThumbnail: boolean;
  // 将视频格式扫描为图像片段
  videoToImage: boolean;
  // 图库封面模式
  imageCoverMode: string;


}


export function getLibrarySetting(): LibrarySetting{
  return {
    items: [],
    scanExtname: ["m4v", "mp4", "mov", "avi", "mpg", "mpeg", "rmvb", "rm", "flv", "asf", "mkv", "webm", "f4v"],
    openExtname: ["m4v", "mp4", "mov", "avi", "mpg", "mpeg", "rmvb", "rm", "flv", "asf", "mkv", "webm", "f4v"],
    videoExclude: [],
    imageExclude: [],
    imageFromImageFolder: false,
    writeImageThumbnail: true,
    videoToImage: false,
    imageCoverMode: '(poster|cover|folder|board)\\.[^\\.]+$'
  }
}