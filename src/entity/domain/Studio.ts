import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface StudioUpdateForm {
  name: string;         // 工作室名称
  country: string;      // 所属国家
  founded_year: number; // 成立年份
  website: string;      // 官网
  logo_path: string;    // Logo 本地路径
}

export interface StudioAddForm extends StudioUpdateForm{
  // 所属收藏库
  library_id: string;
}

export interface Studio extends BaseEntity, StudioAddForm {
}