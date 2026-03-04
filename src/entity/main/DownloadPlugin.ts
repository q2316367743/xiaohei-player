import type {BaseEntity} from "@/entity/BaseEntity.ts";
import type {CommonOption} from "@/global/CommonType.ts";

export type DownloadPluginPlatform =
  | 'douyin'
  | 'bilibili'
  ;

export const DownloadPluginPlatformOptions: Array<CommonOption> = [{
  label: '抖音',
  value: 'douyin'
}, {
  label: '哔哩哔哩',
  value: 'bilibili'
}];

export interface DownloadPluginCore {
  name: string;
  description: string;
  author: string;
  version: string;
  platform: string;
  /**
   * 请求链接
   * @example https://example.com/parse?url={{url}}
   */
  url: string;

  rule_title: string;
  rule_cover: string;
  rule_author: string;
  rule_description: string;
  rule_url: string;
}

export interface DownloadPlugin extends BaseEntity, DownloadPluginCore {

}

export interface DownloadPluginViewCore {
  name: string;
  description: string;
  author: string;
  version: string;
  platform: Array<DownloadPluginPlatform>;
  /**
   * 请求链接
   * @example https://example.com/parse?url={{url}}
   */
  url: string;

  rule_title: string;
  rule_cover: string;
  rule_author: string;
  rule_description: string;
  rule_url: string;

}

export interface DownloadPluginView extends BaseEntity, DownloadPluginViewCore {

}

export function buildDownloadPluginView(data: DownloadPlugin): DownloadPluginView {
  return {
    ...data,
    platform: data.platform.split(',') as Array<DownloadPluginPlatform>,
  }
}

export function buildDownloadPluginCore(data: DownloadPluginViewCore): DownloadPluginCore {
  return {
    ...data,
    platform: data.platform.join(','),
  }
}

export function buildDownloadPluginCorePartial(data: Partial<DownloadPluginViewCore>): Partial<DownloadPluginCore> {
  return {
    ...data,
    platform: data.platform ? data.platform.join(',') : '',
  }
}