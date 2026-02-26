import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface VideoStudio extends BaseEntity {
  video_id: string;   // 对应 video.id
  studio_id: string;  // 对应 studio.id
  role_type: string;  // 角色类型: 'production', 'distribution', 'sponsor'
}