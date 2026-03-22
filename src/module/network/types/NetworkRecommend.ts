import type {NetworkCategory} from "@/module/network/types/NetworkCategory.ts";

export interface NetworkRecommend {
  id: string;
  cover: string;
  title: string;
  category: Omit<NetworkCategory, "children">;
  titleEn?: string;
  // 更新时间
  time: string;
  // 播放来源
  playFrom: string;
  // 备注
  remark?: string;
}