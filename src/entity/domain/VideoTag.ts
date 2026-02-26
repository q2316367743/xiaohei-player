import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface VideoTag extends BaseEntity {
  video_id: string; // 对应 video.id
  tag_id: string;   // 对应 tag.id
}