import type {NetworkPageResult} from "@/module/network/types/NetworkPageResult.ts";
import type {NetworkListItem} from "@/module/network/types/NetworkListItem.ts";

export interface NetworkCommonResult extends NetworkPageResult{
  data: Array<NetworkListItem>;
}