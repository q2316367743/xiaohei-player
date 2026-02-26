import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface Studio extends BaseEntity {
  name: string;         // 工作室名称
  country: string;      // 所属国家
  founded_year: number; // 成立年份
  website: string;      // 官网
  logo_path: string;    // Logo 本地路径
}