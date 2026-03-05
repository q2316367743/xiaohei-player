import type {VideoAddForm} from "@/entity/domain/Video.ts";
import {useSql} from "@/lib/sql.ts";
import type {VideoTag, VideoTagView} from "@/entity/domain/VideoTag.ts";
import type {Tag, TagAddForm} from "@/entity/domain/Tag.ts";
import {map} from "@/util";

export async function saveOrUpdateTag(tags: VideoAddForm['tags'], videoId: string, libraryId: string) {
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
        color: '',
        library_id: libraryId
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

export async function saveVideoTag(videoId: string, tagIds: Array<string>) {
  // 删除旧的
  await useSql().query<VideoTag>('video_tag').eq('video_id', videoId).delete();
  if (tagIds.length > 0) {
    const now = Date.now();
    await useSql().mapper<VideoTag>('video_tag').insertBatch(tagIds.map((tagId) => ({
      video_id: videoId,
      tag_id: tagId,
      created_at: now,
      updated_at: now
    })))
  }
}

export function addTag(form: TagAddForm) {
  const now = Date.now();
  return useSql().mapper<Tag>('tag').insert({
    ...form,
    created_at: now,
    updated_at: now
  });
}

export function listTag(libraryId: string) {
  return useSql().query<Tag>('tag').eq('library_id', libraryId).list();
}

export async function listTagView(videoId: string) {
  const tagIds = await useSql().query<VideoTag>('video_tag').eq('video_id', videoId).list();

  const tags = new Array<VideoTagView>();

  if (tagIds.length > 0) {
    const tagItems = await useSql().query<Tag>('tag').in('id', tagIds.map(e => e.tag_id)).list();
    const tagMap = map(tagItems, 'id');
    for (const tagId of tagIds) {
      const t = tagMap.get(tagId.tag_id);
      if (!t) continue;
      tags.push({
        ...tagId,
        tag: t
      })
    }
  }

  return tags;
}
