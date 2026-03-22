// services/MediaServer.ts
import type {MediaItem} from "@/module/media/types/media/MediaItem.ts";
import type {MediaPerson} from "@/module/media/types/person/MediaPerson.ts";
import type {MediaPlaybackInfo} from "@/module/media/types/playback/MediaPlaybackInfo.ts";
import type {PaginatedResult, PaginationOptions} from "@/module/media/types/common/MediaPage.ts";
import type {MediaDetail} from "@/module/media/types/detail/MediaDetail.ts";
import type {MediaSeason} from "@/module/media/types/detail/MediaSeason.ts";
import type {MediaEpisode} from "@/module/media/types/detail/MediaEpisode.ts";
import type {MediaPlaybackReport} from "@/module/media/types/playback/MediaPlaybackReport.ts";

export interface IMediaServer {
  // 认证
  authenticate(): Promise<void>; // 返回 token 或 session key

  // 媒体库
  getLibraries(): Promise<MediaItem[]>; // 获取根媒体库（电影、剧集等）

  // 内容浏览
  getItems(options: PaginationOptions,parentId?: string): Promise<PaginatedResult<MediaItem>>;
  getItem(id: string): Promise<MediaDetail>; // 获取详情（含元数据）
  // /Shows/NextUp?SeriesId={id}&UserId={userId}&Fields=MediaSourceCount 获取下一个播放内容
  // /Shows/{id}/Seasons 获取剧集
  getItemSeason(id: string): Promise<MediaSeason>; // 获取剧集
  // /Shows/{seriesId}/Episodes?seasonId={seasonId} 获取某一季的所有集
  getItemEpisode(id: string, seasonId: string): Promise<MediaEpisode> // 获取某一季的所有集

  // 搜索
  search(query: string): Promise<MediaItem[]>;

  // 演员相关
  getPeople(itemId: string): Promise<MediaPerson[]>; // 获取某影片的演员/导演
  getPersonDetails(personId: string): Promise<MediaPerson>;
  getPersonMedia(personId: string): Promise<MediaItem[]>; // 该演员出演的作品

  // 播放
  getPlaybackInfo(itemId: string, options?: {
    maxBitrate?: number;
    audioTrackId?: string;
    subtitleId?: string;
  }): Promise<MediaPlaybackInfo>;
  /**
   * 上报播放状态
   */
  report(report: MediaPlaybackReport): Promise<void>;

}