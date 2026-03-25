import {useSql} from "@/lib/sql.ts";
import type {PlayHistory} from "@/entity/statistics/PlayHistory.ts";
import {useSnowflake} from "@/util";
import dayjs from "dayjs";

export interface PlayHistoryAddForm {
  video_id: string;
  library_id: string;
  duration_played: number;
  progress_percent: number;
  completed: boolean;
}

export async function savePlayHistory(form: PlayHistoryAddForm) {
  const now = Date.now();
  const id = useSnowflake().nextId();
  await useSql().mapper<PlayHistory>('play_history').insertSelf({
    id,
    created_at: now,
    updated_at: now,
    video_id: form.video_id,
    library_id: form.library_id,
    played_at: now,
    duration_played: form.duration_played,
    progress_percent: form.progress_percent,
    completed: form.completed ? 1 : 0
  });
  return id;
}

export interface PlayHistoryView extends PlayHistory {
  video_title: string;
  video_cover: string;
  video_duration: number;
}

export async function listRecentPlayHistory(limit: number = 10): Promise<Array<PlayHistoryView>> {
  return useSql().select<Array<PlayHistoryView>>(`
    SELECT ph.*, v.title as video_title, v.cover_path as video_cover, v.duration_ms as video_duration
    FROM play_history ph
    LEFT JOIN video v ON ph.video_id = v.id
    LEFT JOIN library l ON ph.library_id = l.id
    WHERE l.password = ''
    ORDER BY ph.played_at DESC
    LIMIT ?
  `, [limit]);
}

export interface PlayCountByDate {
  date: string;
  count: number;
}

export async function getPlayCountByDateRange(startDate: string, endDate: string): Promise<Array<PlayCountByDate>> {
  return useSql().select<Array<PlayCountByDate>>(`
    SELECT date(datetime(played_at / 1000, 'unixepoch')) as date, COUNT(*) as count
    FROM play_history
    WHERE played_at >= ? AND played_at <= ?
    GROUP BY date
    ORDER BY date ASC
  `, [
    dayjs(startDate).startOf('day').valueOf(),
    dayjs(endDate).endOf('day').valueOf()
  ]);
}

export interface PlayDurationByDate {
  date: string;
  duration: number;
}

export async function getPlayDurationByDateRange(startDate: string, endDate: string): Promise<Array<PlayDurationByDate>> {
  return useSql().select<Array<PlayDurationByDate>>(`
    SELECT date(datetime(played_at / 1000, 'unixepoch')) as date, SUM(duration_played) as duration
    FROM play_history
    WHERE played_at >= ? AND played_at <= ?
    GROUP BY date
    ORDER BY date ASC
  `, [
    dayjs(startDate).startOf('day').valueOf(),
    dayjs(endDate).endOf('day').valueOf()
  ]);
}

export interface TopPlayedVideo {
  video_id: string;
  video_title: string;
  video_cover: string;
  video_duration: number;
  play_count: number;
  total_duration: number;
}

export async function getTopPlayedVideos(limit: number = 5): Promise<Array<TopPlayedVideo>> {
  return useSql().select<Array<TopPlayedVideo>>(`
    SELECT ph.video_id, v.title as video_title, v.cover_path as video_cover, v.duration_ms as video_duration,
           COUNT(*) as play_count, SUM(ph.duration_played) as total_duration
    FROM play_history ph
    LEFT JOIN video v ON ph.video_id = v.id
    LEFT JOIN library l ON ph.library_id = l.id
    WHERE l.password = ''
    GROUP BY ph.video_id
    ORDER BY play_count DESC
    LIMIT ?
  `, [limit]);
}

export interface PlayStatisticsSummary {
  total_play_count: number;
  total_play_duration: number;
  today_play_count: number;
  today_play_duration: number;
  week_play_count: number;
  week_play_duration: number;
}

export async function getPlayStatisticsSummary(): Promise<PlayStatisticsSummary> {
  const now = dayjs();
  const todayStart = now.startOf('day').valueOf();
  const todayEnd = now.endOf('day').valueOf();
  const weekStart = now.startOf('week').valueOf();

  const [total, today, week] = await Promise.all([
    useSql().select<Array<{ count: number; duration: number }>>(`
      SELECT COUNT(*) as count, COALESCE(SUM(duration_played), 0) as duration FROM play_history
    `),
    useSql().select<Array<{ count: number; duration: number }>>(`
      SELECT COUNT(*) as count, COALESCE(SUM(duration_played), 0) as duration 
      FROM play_history 
      WHERE played_at >= ? AND played_at <= ?
    `, [todayStart, todayEnd]),
    useSql().select<Array<{ count: number; duration: number }>>(`
      SELECT COUNT(*) as count, COALESCE(SUM(duration_played), 0) as duration 
      FROM play_history 
      WHERE played_at >= ?
    `, [weekStart])
  ]);

  return {
    total_play_count: total[0]?.count || 0,
    total_play_duration: total[0]?.duration || 0,
    today_play_count: today[0]?.count || 0,
    today_play_duration: today[0]?.duration || 0,
    week_play_count: week[0]?.count || 0,
    week_play_duration: week[0]?.duration || 0
  };
}
