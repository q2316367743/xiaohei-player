import {useSql} from "@/lib/sql.ts";
import type {DailyStatistics} from "@/entity/statistics/DailyStatistics.ts";
import {useSnowflake} from "@/util";
import dayjs from "dayjs";

export async function getDailyStatisticsByDate(date: string): Promise<DailyStatistics | undefined> {
  return useSql().query<DailyStatistics>('daily_statistics')
    .eq('date', date)
    .get();
}

export async function saveOrUpdateDailyStatistics(date: string, updates: Partial<DailyStatistics>) {
  const existing = await getDailyStatisticsByDate(date);
  const now = Date.now();

  if (existing) {
    await useSql().mapper<DailyStatistics>('daily_statistics').updateById(existing.id, {
      ...updates,
      updated_at: now
    });
  } else {
    const id = useSnowflake().nextId();
    await useSql().mapper<DailyStatistics>('daily_statistics').insertSelf({
      id,
      created_at: now,
      updated_at: now,
      date,
      play_count: updates.play_count || 0,
      play_duration: updates.play_duration || 0,
      videos_added: updates.videos_added || 0,
      videos_completed: updates.videos_completed || 0
    });
  }
}

export async function incrementPlayCount(date: string, duration: number) {
  const existing = await getDailyStatisticsByDate(date);
  if (existing) {
    await useSql().mapper<DailyStatistics>('daily_statistics').updateById(existing.id, {
      play_count: existing.play_count + 1,
      play_duration: existing.play_duration + duration,
      updated_at: Date.now()
    });
  } else {
    await saveOrUpdateDailyStatistics(date, {
      play_count: 1,
      play_duration: duration
    });
  }
}

export async function incrementVideosAdded(date: string) {
  const existing = await getDailyStatisticsByDate(date);
  if (existing) {
    await useSql().mapper<DailyStatistics>('daily_statistics').updateById(existing.id, {
      videos_added: existing.videos_added + 1,
      updated_at: Date.now()
    });
  } else {
    await saveOrUpdateDailyStatistics(date, {
      videos_added: 1
    });
  }
}

export async function incrementVideosCompleted(date: string) {
  const existing = await getDailyStatisticsByDate(date);
  if (existing) {
    await useSql().mapper<DailyStatistics>('daily_statistics').updateById(existing.id, {
      videos_completed: existing.videos_completed + 1,
      updated_at: Date.now()
    });
  } else {
    await saveOrUpdateDailyStatistics(date, {
      videos_completed: 1
    });
  }
}

export async function listDailyStatisticsByRange(startDate: string, endDate: string): Promise<Array<DailyStatistics>> {
  return useSql().select<Array<DailyStatistics>>(`
    SELECT * FROM daily_statistics
    WHERE date >= ? AND date <= ?
    ORDER BY date ASC
  `, [startDate, endDate]);
}

export interface DailyStatisticsView {
  date: string;
  play_count: number;
  play_duration: number;
  videos_added: number;
  videos_completed: number;
}

export async function getStatisticsForLastDays(days: number = 7): Promise<Array<DailyStatisticsView>> {
  const result: Array<DailyStatisticsView> = [];
  const today = dayjs();

  const statistics = await listDailyStatisticsByRange(
    today.subtract(days - 1, 'day').format('YYYY-MM-DD'),
    today.format('YYYY-MM-DD')
  );

  const statisticsMap = new Map(statistics.map(s => [s.date, s]));

  for (let i = days - 1; i >= 0; i--) {
    const date = today.subtract(i, 'day').format('YYYY-MM-DD');
    const stat = statisticsMap.get(date);
    result.push({
      date,
      play_count: stat?.play_count || 0,
      play_duration: stat?.play_duration || 0,
      videos_added: stat?.videos_added || 0,
      videos_completed: stat?.videos_completed || 0
    });
  }

  return result;
}
