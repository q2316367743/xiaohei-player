import {useSql} from "@/lib/sql.ts";
import type {Marker, MarkerAddForm} from "@/entity/domain/Marker.ts";
import {convertFileSrcToUrl} from "@/lib/FileSrc.ts";


export async function listMarker(videoId: string): Promise<Array<Marker>> {
  const list = await useSql().query<Marker>('marker').eq('video_id', videoId)
    .list();
  return list.map(e => ({
    ...e,
    image: convertFileSrcToUrl(e.image)
  }))
}

export function addMarker(form: MarkerAddForm) {
  const now = Date.now();
  return useSql().mapper<Marker>('marker').insert({
    ...form,
    created_at: now,
    updated_at: now
  })
}

export function removeMarker(videoId:string) {
  return useSql().query<Marker>('marker').eq('video_id', videoId).delete();

}