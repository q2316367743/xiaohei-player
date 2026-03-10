import {useSql} from "@/lib/sql.ts";
import type {Marker} from "@/entity/domain/Marker.ts";
import {convertFileSrcToUrl} from "@/lib/FileSrc.ts";


export async function listMarker(videoId: string): Promise<Array<Marker>> {
  const list = await useSql().query<Marker>('marker').eq('video_id', videoId)
    .list();
  return list.map(e => ({
    ...e,
    image: convertFileSrcToUrl(e.image)
  }))
}