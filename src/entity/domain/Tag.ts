import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface Tag extends BaseEntity {
  name: string; // 标签名称
  color: string; // 标签显示颜色 (hex)
}