import type {NetworkServer} from "@/entity";
import type {NetworkHome} from "@/module/network/types/NetworkHome.ts";
import type {NetworkSearchResult} from "@/module/network/types/NetworkSearchResult.ts";
import type {NetworkListItem} from "@/module/network/types/NetworkListItem.ts";
import type {NetworkDetail} from "@/module/network/types/NetworkDetail.ts";
import type {NetworkCategoryResult} from "@/module/network/types/NetworkCategoryResult.ts";

export interface INetworkServer {
  props: NetworkServer;

  /**
   * 获取首页数据
   * @param page 页码
   */
  home(page: number): Promise<NetworkHome>;

  /**
   * 获取分类下的视频
   * @param categoryId 分类ID
   * @param page 页码
   */
  getVideos(categoryId: string, page: number): Promise<NetworkCategoryResult>;

  /**
   * 根据关键字搜索视频
   * @param keyword 关键字
   * @param page 页码
   */
  searchVideos(keyword: string, page: number): Promise<NetworkSearchResult>;

  /**
   * 获取视频的信息
   * @param video 视频信息
   */
  getDetail(video: NetworkListItem): Promise<NetworkDetail>;
}