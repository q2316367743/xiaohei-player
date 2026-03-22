import type {MediaPerson} from "@/module/media/types/person/MediaPerson.ts";

export interface MediaPersonPlex extends MediaPerson {
  tag: string;                  // Plex 中用 tag 表示人名
  filter: string;               // 搜索用 filter key
  thumb?: string;               // 头像 URL
  index?: number;               // 排序索引
}