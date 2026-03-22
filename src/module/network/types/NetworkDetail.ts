import type {NetworkListItem} from "@/module/network/types/NetworkListItem.ts";

export interface NetworkDetail extends NetworkListItem {
  recommends: Array<NetworkListItem>;
}