import type {YesOrNo} from "@/global/CommonType.ts";
import type {BaseEntity} from "@/entity/BaseEntity.ts";

export type NetworkServerType = "mc10"

export const NetworkServerTypeOptions = [{
  label: "苹果CMS10",
  value: "mc10"
}]

export function checkNetworkType(type: string) {
  for (const networkServerTypeOption of NetworkServerTypeOptions) {
    if (networkServerTypeOption.value === type) {
      return true;
    }
  }
  return false;
}


export function checkNetworkFormat(format: string) {
  return format === "json" || format === "xml";
}


export const NetworkServerTypeLabel = {
  mc10: "苹果CMS10"
}

export interface NetworkServerEdit {

  group: string;
  // 顺序
  sequence: number;

  name: string;
  type: NetworkServerType;
  format: "json" | "xml"
  url: string;
  /**
   * m3u8解析地址
   * @example https://xxx.com/?url=
   */
  m3u8_parse: string;
  // 是否用于聚合搜索
  is_aggregate_search: YesOrNo;
  // 主页
  home: string;
}

export interface NetworkServer extends BaseEntity, NetworkServerEdit {
}

export function buildNetworkServerEdit(): NetworkServerEdit {
  return {
    group: "",
    sequence: 0,
    name: "",
    type: "mc10",
    format: "json",
    url: "",
    m3u8_parse: "",
    is_aggregate_search: 1,
    home: ""
  }
}