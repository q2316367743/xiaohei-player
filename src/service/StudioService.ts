import {useSql} from "@/lib/sql.ts";
import type {Studio, StudioAddForm} from "@/entity/domain/Studio.ts";

export async function saveOrUpdateStudio(studio: string, libraryId: string) {
  if (!studio) return '';
  let studio_id: string;
  const studioEntry = await useSql().query<Studio>('studio').eq('name', studio).get();
  if (studioEntry) {
    studio_id = studioEntry.id;
  } else {
    const {id} = await useSql().mapper<Studio>('studio').insert({
      library_id: libraryId,
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

export function addStudio(form: StudioAddForm) {
  const now = Date.now();
  return useSql().mapper<Studio>('studio').insert({
    ...form,
    created_at: now,
    updated_at: now
  });
}

export function listStudio(libraryId: string) {
  return useSql().query<Studio>('studio').eq('library_id', libraryId).list();
}

export function getStudio(id: string) {
  if (!id) return undefined;
  return useSql().query<Studio>('studio').eq('id', id).get();
}