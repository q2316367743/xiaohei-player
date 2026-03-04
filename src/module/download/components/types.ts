import type {DownloadPluginPlatform} from "@/entity/main/DownloadPlugin.ts";

export interface DownloadResult {
  title: string;
  cover?: string;
  author?: string;
  description?: string;
  // 视频链接
  video: string;

  // 元数据
  url: string;
  platform: DownloadPluginPlatform
}

interface NfoProp {
  title: string;
  cover?: string;
  author?: string;
  description?: string;
}

/**
 * 转换下载结果为 nfo
 * @param prop 下载结果
 */
export function transferDrToNfo(prop: NfoProp): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<movie>
  <title>${prop.title}</title>
  ${prop.description ? `<plot>${prop.description}</plot>` : ''}
  ${prop.author ? `<director>${prop.author}</director>` : ''}
  ${prop.cover ? `<thumb>${prop.cover}</thumb>` : ''}
</movie>`
}