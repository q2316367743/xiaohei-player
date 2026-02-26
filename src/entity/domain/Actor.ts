import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface Actor extends BaseEntity {
  name: string;          // 演员姓名 (如: "张彪")
  original_name: string; // 原名/英文名
  gender: string;        // 性别: 'male', 'female', 'other'
  birth_date: string;    // 出生日期
  death_date: string;    // 逝世日期 (可选)
  biography: string;     // 简介
  photo_path: string;    // 头像本地路径
}