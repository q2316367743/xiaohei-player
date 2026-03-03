import type {BaseEntity} from "@/entity/BaseEntity.ts";

/**
 * 收藏库的一项
 */
export interface LibraryItem extends BaseEntity {
  // 封面，解析后的第一个视频
  cover: string;
  // 名字
  name: string;
  // 路径
  path: string;
  // 密码
  password: string;
}