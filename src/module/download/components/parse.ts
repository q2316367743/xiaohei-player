import {JSONPath} from 'jsonpath-plus';
import type {DownloadPluginPlatform, DownloadPluginView} from "@/entity/main/DownloadPlugin.ts";
import {getAction} from "@/lib/http.ts";
import type {DownloadResult} from "@/module/download";


export async function pluginParse(plugin: DownloadPluginView, url: string, platform: DownloadPluginPlatform): Promise<DownloadResult> {
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
  let author: string | undefined = undefined;
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
  if (plugin.rule_author) {
    author = JSONPath({
      path: plugin.rule_author,
      json: data
    });
  }
  const video = JSONPath({
    path: plugin.rule_url,
    json: data
  });
  return {
    title: `${title}`,
    cover: cover ? `${cover}` : undefined,
    author: author ? `${author}` : undefined,
    description: description ? `${description}` : undefined,
    video: `${video}`,
    platform,
    url: url,
  };
}