import type {NetworkListItemUrl} from "@/module/network/types/NetworkListItemUrl.ts";

export interface NetworkListItemChapter {
  id: string;
  name: string;
  items: Array<NetworkListItemUrl>;
}