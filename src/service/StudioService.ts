import {useSql} from "@/lib/sql.ts";
import type {Studio, StudioCore} from "@/entity/domain/Studio.ts";

export async function saveOrUpdateStudio(studio: string) {
  if (!studio) return '';
  let studio_id: string;
  const studioEntry = await useSql().query<Studio>('studio').eq('name', studio).get();
  if (studioEntry) {
    studio_id = studioEntry.id;
  } else {
    const {id} = await useSql().mapper<Studio>('studio').insert({
      name: studio,
      country: '',
      founded_year: 0,
      website: '',
      logo_path: ''
    });
    studio_id = id;
  }
  return studio_id
}

export function listStudio() {
  return useSql().query<Studio>('studio').list();
}

export function addStudio(form: StudioCore) {
  const now = Date.now();
  return useSql().mapper<Studio>('studio').insert({
    ...form,
    created_at: now,
    updated_at: now
  });
}