import { XMLParser } from 'fast-xml-parser';
import type { NetworkServer } from "@/entity";
import type { NetworkCategoryResult } from "@/module/network/types/NetworkCategoryResult.ts";
import { getAction } from "@/lib/http.ts";
import type { NetworkSearchResult } from "@/module/network/types/NetworkSearchResult.ts";
import { cmsTreeTransfer } from "@/module/network/CmsUtil.ts";
import type { NetworkHome } from "@/module/network/types/NetworkHome.ts";
import type { NetworkListItem } from "@/module/network/types/NetworkListItem.ts";
import type { NetworkDetail } from "@/module/network/types/NetworkDetail.ts";
import type { NetworkListItemChapter } from "@/module/network/types/NetworkListItemChapter.ts";
import type { INetworkServer } from "@/module/network/INetworkServer.ts";


export class NetworkServerMc10Xml implements INetworkServer {

  public props: NetworkServer;
  private readonly url: string;
  private readonly parser: XMLParser;

  constructor(props: NetworkServer) {
    this.props = props;
    this.url = props.url;
    this.parser = new XMLParser({
      attributeNamePrefix: '@_',
      ignoreAttributes: false
    });
  }

  private async cToL(params: Record<string, any>): Promise<NetworkCategoryResult> {
    const { data } = await getAction<string>(this.url, params, {
      responseType: 'text'
    });
    const xml = this.parser.parse(data);
    const list = xml.rss.list;
    return {
      limit: Number(list['@_pagesize']),
      page: Number(list['@_page']),
      total: Number(list['@_recordcount']),
      data: list.video ? ((Array.isArray(list.video) ? list.video : [list.video]) as Array<any>)?.map(e => {
        const chapters = new Array<NetworkListItemChapter>();
        const dds: Array<any> = Array.isArray(e.dl.dd) ? e.dl.dd : [e.dl.dd];
        dds.forEach((dd) => {
          if (typeof dd === 'string') {
            chapters.push({
              id: this.props.id,
              name: this.props.name,
              items: dd.split('#').map(e => {
                const temp = e.split('$');
                return {
                  name: temp[0]!,
                  url: temp[1]!
                }
              })
            })
          } else {
            chapters.push({
              id: encodeURIComponent(dd['@_flag']),
              name: dd['@_flag'],
              items: (dd['#text'] as string).split('#').map(ddString => {
                const temp = ddString.split('$');
                return {
                  name: temp[0]!,
                  url: temp[1]!
                }
              })
            })
          }
        })
        return {
          id: e.id + '',
          type: 'Series',
          cover: e.pic,
          title: e.name,
          subtitle: e.sub || '',
          types: e.type.split(','),
          actors: e.actor.split(','),
          directors: e.director.split(','),
          writers: e.writer?.split(',') || [],
          remark: e.note,
          releaseDate: e.last || '',
          total: e.total || '',
          region: e.area,
          language: e.lang,
          releaseYear: e.year,
          duration: e.duration || '',
          content: e.des,
          chapters
        }
      }) || [] : []
    }
  }

  async getDetail(video: NetworkListItem): Promise<NetworkDetail> {
    // https://caiji.dyttzyapi.com/api.php/provide/vod?ac=videolist&ids=48327
    const results = await this.cToL({
      ac: 'videolist',
      ids: video.id
    })
    return {
      ...video,
      ...results.data[0]!,
      recommends: results.data.slice(1)
    };
  }

  async home(page: number): Promise<NetworkHome> {
    const { data } = await getAction<string>(this.url, {
      ac: 'class',
      pg: page
    }, { responseType: 'text' });
    const xml = this.parser.parse(data);
    const list = xml.rss.list;
    return {
      limit: Number(list['@_pagesize']),
      page: Number(list['@_page']),
      total: Number(list['@_recordcount']),
      recommends: (list.video as Array<any>)?.map(e => ({
        id: e.id,
        cover: '',
        title: e.name,
        category: {
          id: e.tid,
          name: e.type,
          cover: '',
          children: []
        },
        titleEn: e.vod_en,
        time: e.last,
        playFrom: e.dt,
        remark: e.note
      })) || [],
      categories: cmsTreeTransfer((xml.rss.class.ty as Array<any>).map(t => ({
        type_id: t['@_id'],
        type_name: t['#text'],
        type_pid: t['@_pid']
      })))
    }
  }

  async getVideos(categoryId: string, page: number): Promise<NetworkCategoryResult> {
    return this.cToL({
      ac: 'videolist',
      t: categoryId,
      pg: page
    });
  }

  async searchVideos(keyword: string, page: number): Promise<NetworkSearchResult> {
    return this.cToL({
      ac: 'videolist',
      wd: keyword,
      pg: page
    });
  }

}