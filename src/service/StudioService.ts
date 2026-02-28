import {useSql} from "@/lib/sql.ts";
import type {Studio} from "@/entity/domain/Studio.ts";

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