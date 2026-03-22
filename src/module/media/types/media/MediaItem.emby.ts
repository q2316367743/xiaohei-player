import type {MediaItem} from "@/module/media/types/media/MediaItem.ts";

/**
 * Emby 与 Jellyfin 高度兼容，字段几乎一致
 * 此处可复用大部分逻辑，或直接 alias
 */
export interface MediaItemEmby extends MediaItem{
  // Emby 字段基本同 Jellyfin
  officialRating?: string;
  communityRating?: number;
  path?: string;
  isFolder: boolean;
  childCount?: number;
  providerIds?: {
    Tmdb?: string;
    Imdb?: string;
    Tvdb?: string;
  };

}