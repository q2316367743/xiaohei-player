import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface LibraryCore {
  // 名字
  name: string;
  // 路径
  path: string;
  // 密码
  password: string;
}

/**
 * 收藏库
 */
export interface LibraryEntity extends BaseEntity, LibraryCore {
  // 封面，解析后的第一个视频
  cover: string;
}