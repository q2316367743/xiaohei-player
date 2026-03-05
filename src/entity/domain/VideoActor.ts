import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {Actor} from "@/entity/domain/Actor.ts";

export interface VideoActor extends BaseEntity {
  video_id: string;    // 对应 videos.id (Hash)
  actor_id: string;    // 对应 actors.id
  role_name: string;   // 在该视频中饰演的角色名
  order_index: number; // 演员排序 (主演在前)
}

export interface VideoActorView extends VideoActor{
  actor: Actor
}