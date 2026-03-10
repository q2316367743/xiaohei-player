import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface MarkerUpdateForm {
  // 名称
  name: string;
  // 时间
  time: number;
  // 描述
  description: string;
  // 封面地址
  image: string;
}

export interface MarkerAddForm extends MarkerUpdateForm {
  library_id: string;
  video_id: string;
}

export interface Marker extends BaseEntity, MarkerAddForm {

}
