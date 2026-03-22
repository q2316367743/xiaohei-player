import type {NetworkListItemChapter} from "@/module/network/types/NetworkListItemChapter.ts";

export interface NetworkListItem {

  id: string;
  type: 'Movie' | 'Series'
  cover: string;
  // 标题
  title: string;
  // 副标题
  subtitle: string;
  // 标签
  types: Array<string>;
  // 演员表
  actors: Array<string>;
  // 编剧
  directors: Array<string>;
  // 导演
  writers: Array<string>;
  // 备注,更新至多少集
  remark: string;
  // 上映时间
  releaseDate: string;
  // 总集数
  total: number;
  // 地区
  region: string;
  // 语言
  language: string;
  // 上映年份
  releaseYear: string;
  // 每集时长
  duration: string;
  // 内容，剧情简介，可能是html
  content: string;
  // 章节目录
  chapters: Array<NetworkListItemChapter>;
}