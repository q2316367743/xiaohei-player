import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface TagUpdateForm {
  name: string; // 标签名称
  color: string; // 标签显示颜色 (hex)
}

export interface TagAddForm extends TagUpdateForm {
  // 所属收藏库
  library_id: string;
}

export interface Tag extends BaseEntity, TagAddForm {
}