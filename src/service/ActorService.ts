import type {Video, VideoActorIdForm, VideoAddForm} from "@/entity/domain/Video.ts";
import {useSql} from "@/lib/sql.ts";
import type {VideoActor, VideoActorView} from "@/entity/domain/VideoActor.ts";
import type {Actor, ActorAddForm} from "@/entity/domain/Actor.ts";
import {map} from "@/util";

export async function saveOrUpdateActor(actors: VideoAddForm['actors'], videoId: string, libraryId: string) {
  if (!actors) return;
  // 删除旧的
  await useSql().query<VideoActor>('video_actor').eq('video_id', videoId).delete();
  const actorNames = actors.map(actor => actor.name);
  if (actors.length > 0) {
    const existActors = await useSql().query<Actor>('actor').in('name', actorNames).list();
    const actorMap = map(existActors, 'name');
    for (let i = 0; i < actors.length; i++) {
      const {name: actorName, role: roleName} = actors[i]!;
      const actor = actorMap.get(actorName);
      let actor_id: string;
      if (actor) {
        // 已经有了，关联
        actor_id = actor.id;
      } else {
        // 新增
        const {id} = await useSql().mapper<Actor>('actor').insert({
          library_id: libraryId,
          name: actorName,
          original_name: actorName,
          gender: 'other',
          biography: '',
          death_date: '',
          birth_date: '',
          photo_path: ''
        });
        actor_id = id;
      }
      await useSql().mapper<VideoActor>('video_actor').insert({
        video_id: videoId,
        actor_id,
        role_name: roleName,
        order_index: i
      })
    }
  }
}

export async function saveVideoActor(videoId: string, actorIds: Array<VideoActorIdForm>) {
  // 删除旧的
  await useSql().query<VideoActor>('video_actor').eq('video_id', videoId).delete();
  if (actorIds.length > 0) {
    const now = Date.now();
    await useSql().mapper<VideoActor>('video_actor').insertBatch(actorIds.map((actor, i) => ({
      video_id: videoId,
      actor_id: actor.id,
      role_name: actor.role_name,
      order_index: i,
      created_at: now,
      updated_at: now
    })))
  }
}

export function addActor(form: ActorAddForm) {
  const now = Date.now();
  return useSql().mapper<Actor>('actor').insert({
    ...form,
    created_at: now,
    updated_at: now
  });
}

export function listActor(libraryId: string) {
  return useSql().query<Actor>('actor').eq('library_id', libraryId).list();
}

export async function listActorView(videoId: string): Promise<Array<VideoActorView>> {
  const actorIds = await useSql().query<VideoActor>('video_actor').eq('video_id', videoId).list();
  const actor = new Array<VideoActorView>();
  if (actorIds.length > 0) {
    const actorItems = await useSql().query<Actor>('actor').in('id', actorIds.map(e => e.actor_id)).list();
    const actorMap = map(actorItems, 'id');
    for (const actorId of actorIds) {
      const t = actorMap.get(actorId.actor_id);
      if (!t) continue;
      actor.push({
        ...actorId,
        actor: t
      })
    }
  }
  return actor;
}

export function getActor(id: string) {
  return useSql().query<Actor>('actor').eq('id', id).get();
}

export async function listVideoByActorId(actorId: string) {
  const list = await useSql().query<VideoActor>("video_actor").eq('actor_id', actorId).list();
  if (list.length > 0) {
    return await useSql().query<Video>("video").in('id', list.map(e => e.video_id)).list();
  }
  return [];
}

