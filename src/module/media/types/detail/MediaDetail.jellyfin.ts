import type {MediaDetail} from "@/module/media/types/detail/MediaDetail.ts";

export interface MediaDetailJellyfin extends MediaDetail {
  premiereDate?: string;
  endDate?: string;
  sortName?: string;
  customRating?: number;
  communityRating?: number;
  criticRating?: number;
  metascore?: number;
  awards?: Array<unknown>;
  tags?: Array<unknown>;
  productionYear?: string;
  status?: string;
  video3DFormat?: string;
  aspectRatio?: string;
  videoRange?: string;
  width?: string;
  height?: string;
  size?: string;
  container?: string;
  isHD?: string;
  path?: string;
  fileName?: string;

  keywords?: string[];
  seriesStudio?: string;
  seriesStatus?: string;
  displayOrder?: string;
  officialRatingDescription?: string;
  primaryImageAspectRatio?: string;
  isShortcut?: string;
  extraIds?: string[]; // 额外ID
  extraType: string; // 额外类型
  trickplayToken: string; // 特技播放令牌
  collectionType: string; // 收藏类型
  album: string; // 专辑
  albumId: string; // 专辑ID
  albumArtist: string; // 专辑艺术家
  artistItems?: {id: string,name:string,imageUrl: string}[]; // 额外ID
  seriesPresentationUniqueKey?: string; // 系列展示唯一键
  presentationUniqueKey?: string; // 展示唯一键

  // --- 新增系列统计信息 ---
  recursiveItemCount?: number; // 递归项目计数
  childCount?: number; // 子项目计数
  cumulativeRunTimeTicks?: number; // 累计运行时间
  seasonUserData?: number; // 季用户数据
  seriesUserData?: number; // 系列用户数据
}