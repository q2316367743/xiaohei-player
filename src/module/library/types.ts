import type {LibraryEntity} from "@/entity/main/LibraryEntity.ts";
import type {CommonOption} from "@/global/CommonType.ts";

/**
 * 扫描的视频文件
 */
export interface ScanVideoFile {
  // 所属资料库
  item: LibraryEntity;
  // 文件所在目录
  fileDir: string;
  // 文件目录
  filePath: string;
  // 文件名
  fileName: string;

  // 可能存在的封面
  cover: string;
  caption?: Array<CommonOption>;
  // 可能存在的 nfo
  nfo: string;
}