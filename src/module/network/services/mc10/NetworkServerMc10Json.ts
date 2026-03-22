import type {INetworkServer} from "@/module/network/INetworkServer.ts";
import type {NetworkServer} from "@/entity";
import type {CmsHomeResult, CmsVideoList} from "@/module/network/types/NetworkCommon.ts";
import {getAction} from "@/lib/http.ts";
import type {NetworkListItemChapter} from "@/module/network/types/NetworkListItemChapter.ts";
import type {NetworkCategoryResult} from "@/module/network/types/NetworkCategoryResult.ts";
import type {NetworkDetail} from "@/module/network/types/NetworkDetail.ts";
import type {NetworkListItem} from "@/module/network/types/NetworkListItem.ts";
import type {NetworkHome} from "@/module/network/types/NetworkHome.ts";
import type {NetworkSearchResult} from "@/module/network/types/NetworkSearchResult.ts";
import {cmsTreeTransfer} from "@/module/network/CmsUtil.ts";


export class NetworkServerMc10Json implements INetworkServer {

  public props: NetworkServer;
  private readonly url: string;

  constructor(props: NetworkServer) {
    this.props = props;
    this.url = props.url;
  }

  private async cToL(params: Record<string, any>): Promise<NetworkCategoryResult> {
    const {data} = await getAction<CmsVideoList>(this.url, params);
    return {
      limit: Number(data.limit),
      page: Number(data.page),
      total: Number(data.total),
      data: data.list?.map(e => {
        const chapters = new Array<NetworkListItemChapter>();
        if (e.vod_play_note) {
          const chapterNames = e.vod_play_from.split(e.vod_play_note);
          e.vod_play_url.split(e.vod_play_note).forEach((e, i) => {
            const chapterName = chapterNames[i] || '';
            chapters.push({
              id: encodeURIComponent(chapterName),
              name: chapterName,
              items: e.split('#').map(e => {
                const temp = e.split('$');
                return {
                  name: temp[0]!,
                  url: temp[1]!
                }
              })
            })
          })
        } else {
          chapters.push({
            id: encodeURIComponent(this.props.name),
            name: this.props.name,
            items: e.vod_play_url.split('#').map(e => {
              const temp = e.split('$');
              return {
                name: temp[0]!,
                url: temp[1]!
              }
            })
          })
        }
        return {
          id: e.vod_id + '',
          type: 'Series',
          cover: e.vod_pic,
          title: e.vod_name,
          subtitle: e.vod_sub,
          types: e.vod_tag?.split(',') || [],
          actors: e.vod_actor?.split(',') || [],
          directors: e.vod_director?.split(',') || [],
          writers: e.vod_writer?.split(',') || [],
          remark: e.vod_remarks,
          releaseDate: e.vod_pubdate,
          total: e.vod_total,
          region: e.vod_area,
          language: e.vod_lang,
          releaseYear: e.vod_year,
          duration: e.vod_duration,
          content: e.vod_content,
          chapters
        }
      }) || []
    }
  }

  async getDetail(video: NetworkListItem): Promise<NetworkDetail> {
    // https://caiji.dyttzyapi.com/api.php/provide/vod?ac=videolist&ids=48327
    const results = await this.cToL({
      ac: 'videolist',
      ids: video.id
    })
    return {
      ...results.data[0]!,
      recommends: results.data.slice(1)
    };
  }

  async home(page: number): Promise<NetworkHome> {
    const {data} = await getAction<CmsHomeResult>(this.url, {
      ac: 'class',
      pg: page
    });
    return {
      limit: Number(data.limit),
      page: Number(data.page),
      total: Number(data.total),
      recommends: data.list.map(e => ({
        id: e.vod_id + '',
        cover: '',
        title: e.vod_name,
        category: {
          id: e.type_id + '',
          name: e.type_name,
          cover: '',
          children: []
        },
        titleEn: e.vod_en,
        time: e.vod_time,
        playFrom: e.vod_play_from
      })),
      categories: data.class ? cmsTreeTransfer(data.class) : []
    }
  }

  async getVideos(categoryId: string, page: number): Promise<NetworkCategoryResult> {
    // https://caiji.dyttzyapi.com/api.php/provide/vod?ac=videolist&t=&pg=
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