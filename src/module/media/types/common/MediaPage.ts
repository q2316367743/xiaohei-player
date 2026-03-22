export type MediaPageSortBy =
  | 'SortName'          // 忽略冠词的标题（推荐默认）
  | 'Name'              // 原始标题
  | 'DateCreated'       // 添加到库的时间
  | 'PremiereDate'      // 上映/首播日期
  | 'CommunityRating'   // 社区评分
  | 'CriticRating'      // 专业评分
  | 'PlayCount'         // 播放次数
  | 'DatePlayed'        // 最后播放时间
  | 'Runtime'           // 时长
  | 'Random';           // 随机

export const MediaPageSortOptions: Array<{ label: string; value: MediaPageSortBy }> = [
  { label: '标题', value: 'SortName' },
  { label: '添加时间', value: 'DateCreated' },
  { label: '上映日期', value: 'PremiereDate' },
  { label: '评分', value: 'CommunityRating' },
  { label: '播放次数', value: 'PlayCount' },
  { label: '最后播放', value: 'DatePlayed' },
  { label: '时长', value: 'Runtime' },
  { label: '随机', value: 'Random' },
];


export interface PaginationOptions {
  page?: number;        // 页码（从 1 开始）
  pageSize?: number;    // 每页数量（默认 20~50）

  // --- 排序（核心！）---
  sortBy?: MediaPageSortBy;
  sortOrder?: 'Ascending' | 'Descending';

  // --- 过滤（可选扩展）---
  genres?: string[];     // 按类型过滤
  years?: number[];      // 年份范围
  isFavorite?: boolean;  // 仅收藏
  isUnplayed?: boolean;  // 未观看

  type?: "Movie" | "Series"
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;        // 总数（用于分页器）
  hasNext: boolean;     // 是否还有下一页（用于“加载更多”）
}


