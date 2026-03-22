import type {MediaPageSortBy} from "@/module/media/types/common/MediaPage.ts";

export function mapSortByToPlex(sortBy: MediaPageSortBy): string {
  const map: Record<MediaPageSortBy, string> = {
    SortName: 'titleSort',
    Name: 'title',
    DateCreated: 'addedAt',
    PremiereDate: 'originallyAvailableAt',
    CommunityRating: 'rating',       // Plex 的 rating = 社区评分
    CriticRating: 'rating',          // Plex 无独立 critic rating，复用 rating
    PlayCount: 'viewCount',
    DatePlayed: 'lastViewedAt',
    Runtime: 'duration',
    Random: 'random',
  };
  return map[sortBy];
}