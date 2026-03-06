import {useSql} from "@/lib/sql.ts";
import type {HistoryAddForm, HistoryEntity, HistoryUpdateForm} from "@/entity/main/HistoryEntity.ts";

export function listHistory() {
  return useSql().query<HistoryEntity>('history')
    .orderByDesc('last_played_time')
    .lastSql("LIMIT 100")
    .list();
}

export async function addOrUpdateHistory(form: HistoryAddForm) {
  const target = await useSql().query<HistoryEntity>('history')
    .eq('path', form.path)
    .get();
  const now = Date.now();
  if (target) {
    await useSql().mapper<HistoryEntity>('history').updateById(target.id, {
      last_played_time: now,
      updated_at: now,
    });
    return target.id;
  } else {
    const {id} = await useSql().mapper<HistoryEntity>('history').insert({
      ...form,
      progress_second: 0,
      last_played_time: now,
      created_at: now,
      updated_at: now,
    });
    return id;
  }
}

export async function updateHistoryProcess(id: string, form: HistoryUpdateForm) {
  await useSql().mapper<HistoryEntity>('history').updateById(id, {
    progress_second: form.progress_second,
    updated_at: Date.now(),
  });
}