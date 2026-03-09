import {JSONPath} from 'jsonpath-plus';
import type {DownloadPluginPlatform, DownloadPluginView} from "@/entity/main/DownloadPlugin.ts";
import {getAction} from "@/lib/http.ts";
import type {DownloadResult} from "@/module/download";

interface AutoResult {
  code: number;
  msg: string;
  data: Data;
}

interface Data {
  url: string;
  title: string;
  interfaceType: 1 | 3;
  downurl: string;
  photo: string;
  pics: any[];
  type: number;
  liveImg: any[];
  author: Author;
  music_url: string;
  sourceUrl: string;
}

interface Author {
  uid: string;
  name: string;
  avatar: string;
}

const platformMap: Record<number, DownloadPluginPlatform> = {
  1: 'douyin',
  3: 'bilibili'
}

export async function pluginAutoParse(url: string): Promise<DownloadResult> {
  const {data} = await getAction<AutoResult>(`https://videoapi.funjs.top/api/parseUrl/query?platform=chrome&code=010101&url=${url}`)

  return {
    title: data.data.title,
    cover: data.data.photo,
    author: data.data.author.name || '',
    description: '',
    video: data.data.downurl,
    platform: platformMap[data.data.interfaceType]!,
    url: url
  }
}

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