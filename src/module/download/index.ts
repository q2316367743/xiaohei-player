import {JSONPath} from 'jsonpath-plus';
import type {DownloadPluginView} from "@/entity/main/DownloadPlugin.ts";
import {getAction} from "@/lib/http.ts";

export interface DownloadResult {
  title: string;
  cover?: string;
  author?: string;
  description?: string;
  url: string;
  extra?: {
    // 需要符合 nfo 规范
    [key: string]: string;
  }
}

export async function parseDownloadUrl(plugin: DownloadPluginView, url: string): Promise<DownloadResult> {
  // 获取链接
  const target = plugin.url.replace('{{url}}', url);
  // 请求
  const result = await getAction(target);
  const data = result.data;

  const title = JSONPath({
    path: plugin.rule_title,
    json: data
  });
  let cover: string | undefined = undefined;
  let description: string | undefined = undefined;
  if (plugin.rule_cover) {
    cover = JSONPath({
      path: plugin.rule_cover,
      json: data
    });
  }
  if (plugin.rule_description) {
    description = JSONPath({
      path: plugin.rule_description,
      json: data
    });
  }
  const targetUrl = JSONPath({
    path: plugin.rule_url,
    json: data
  });
  return {
    title: `${title}`,
    cover: cover ? `${cover}` : undefined,
    description: description ? `${description}` : undefined,
    url: `${targetUrl}`
  };
}