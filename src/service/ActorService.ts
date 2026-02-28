import type {VideoAddForm} from "@/entity/domain/Video.ts";
import {useSql} from "@/lib/sql.ts";
import type {VideoActor} from "@/entity/domain/VideoActor.ts";
import type {Actor} from "@/entity/domain/Actor.ts";
import {map} from "@/util";

export async function saveOrUpdateActor(actors: VideoAddForm['actors'], videoId: string) {
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
