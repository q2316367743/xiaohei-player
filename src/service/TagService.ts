import type {VideoAddForm} from "@/entity/domain/Video.ts";
import {useSql} from "@/lib/sql.ts";
import type {VideoTag} from "@/entity/domain/VideoTag.ts";
import type {Tag} from "@/entity/domain/Tag.ts";
import {map} from "@/util";

export async function saveOrUpdateTag(tags: VideoAddForm['tags'], videoId: string) {
  await useSql().query<VideoTag>('video_tag').eq('video_id', videoId).delete();

  if (tags.length === 0) return;

  const oldTags = await useSql().query<Tag>('tag').in('name', tags).list();
  const oldTagMap = map(oldTags, 'name');
  for (const tag of tags) {
    const oldTag = oldTagMap.get(tag);
    let tag_id: string;
    if (oldTag) {
      // 存在
      tag_id = oldTag.id;
    } else {
      const {id} = await useSql().mapper<Tag>('tag').insert({
        name: tag,
        color: ''
      });
      tag_id = id;
    }
    // 插入关系
    await useSql().mapper<VideoTag>('video_tag').insert({
      video_id: videoId,
      tag_id
    })
  }
}