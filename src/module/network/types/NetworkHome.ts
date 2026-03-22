import type {NetworkRecommend} from "@/module/network/types/NetworkRecommend.ts";
import type {NetworkPageResult} from "@/module/network/types/NetworkPageResult.ts";
import type {NetworkCategory} from "@/module/network/types/NetworkCategory.ts";

export interface NetworkHome extends NetworkPageResult {
  // 推荐
  recommends: Array<NetworkRecommend>;
  // 分类
  categories: Array<NetworkCategory>;
}