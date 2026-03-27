import {useSql} from "@/lib/sql.ts";
import type {PlayHistory} from "@/entity/statistics/PlayHistory.ts";
import dayjs from "dayjs";
import type {YesOrNo} from "@/global/CommonType.ts";

export interface PlayHistoryAddForm {
  video_id: string;
  library_id: string;
  duration_played: number;
  progress_percent: number;
  completed: YesOrNo;
}

export async function savePlayHistory(form: PlayHistoryAddForm) {
  const now = Date.now();
  const {id} = await useSql().mapper<PlayHistory>('play_history').insert({
    created_at: now,
    updated_at: now,
    video_id: form.video_id,
    library_id: form.library_id,
    played_at: now,
    duration_played: form.duration_played,
    progress_percent: form.progress_percent,
    completed: form.completed
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
        AND ph.id = (
          SELECT id FROM play_history ph2
          WHERE ph2.video_id = ph.video_id
          ORDER BY ph2.created_at DESC
          LIMIT 1
        )
      ORDER BY ph.created_at DESC
      LIMIT ?
  `, [limit]);
}

export interface PlayCountByDate {
  date: string;
  count: number;
}

export async function getPlayCountByDateRange(startDate: string, endDate: string): Promise<Array<PlayCountByDate>> {
  return useSql().select<Array<PlayCountByDate>>(`
      SELECT date(datetime(created_at / 1000, 'unixepoch')) as date, COUNT(*) as count
      FROM play_history
      WHERE created_at >= ?
        AND created_at <= ?
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
      SELECT date(datetime(created_at / 1000, 'unixepoch')) as date, SUM(duration_played) as duration
      FROM play_history
      WHERE created_at >= ?
        AND created_at <= ?
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
      SELECT ph.video_id,
             v.title                 as video_title,
             v.cover_path            as video_cover,
             v.duration_ms           as video_duration,
             COUNT(*)                as play_count,
             SUM(ph.duration_played) as total_duration
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
        SELECT COUNT(*) as count, COALESCE(SUM(duration_played), 0) as duration
        FROM play_history
    `),
    useSql().select<Array<{ count: number; duration: number }>>(`
        SELECT COUNT(*) as count, COALESCE(SUM(duration_played), 0) as duration
        FROM play_history
        WHERE created_at >= ?
          AND created_at <= ?
    `, [todayStart, todayEnd]),
    useSql().select<Array<{ count: number; duration: number }>>(`
        SELECT COUNT(*) as count, COALESCE(SUM(duration_played), 0) as duration
        FROM play_history
        WHERE created_at >= ?
    `, [weekStart])
  ]);

  console.log(total, today, week)
  return {
    total_play_count: total[0]?.count || 0,
    total_play_duration: total[0]?.duration || 0,
    today_play_count: today[0]?.count || 0,
    today_play_duration: today[0]?.duration || 0,
    week_play_count: week[0]?.count || 0,
    week_play_duration: week[0]?.duration || 0
  };
}

export interface PlayHistoryUpdateForm {
  played_at: number;       // 播放时间戳，本次播放到了的进度，是指观看这个视频到哪里了
  duration_played: number; // 本次播放时长，代表了本次观看时间，单位豪秒，与视频长度无关
  progress_percent: number; // 播放进度百分比
  completed: YesOrNo;       // 是否播放完成 0/1
}

export function updatePlayHistory(id: string, form: Partial<PlayHistoryUpdateForm>) {
  return useSql().mapper<PlayHistory>('play_history')
    .updateById(id, {
      ...form,
      updated_at: Date.now()
    })
}

export interface PlayTrendView {
  date: string;
  play_count: number;
  play_duration: number;
}

export async function getPlayTrendForLastDays(days: number = 7): Promise<Array<PlayTrendView>> {
  const result: Array<PlayTrendView> = [];
  const today = dayjs();

  const startDate = today.subtract(days - 1, 'day').startOf('day').valueOf();
  const endDate = today.endOf('day').valueOf();

  const statistics = await useSql().select<Array<{ date: string; count: number; duration: number }>>(`
    SELECT 
      date(datetime(created_at / 1000, 'unixepoch')) as date, 
      COUNT(*) as count, 
      COALESCE(SUM(duration_played), 0) as duration
    FROM play_history
    WHERE created_at >= ? AND created_at <= ?
    GROUP BY date
    ORDER BY date ASC
  `, [startDate, endDate]);

  const statisticsMap = new Map(statistics.map(s => [s.date, s]));

  for (let i = days - 1; i >= 0; i--) {
    const date = today.subtract(i, 'day').format('YYYY-MM-DD');
    const stat = statisticsMap.get(date);
    result.push({
      date,
      play_count: stat?.count || 0,
      play_duration: stat?.duration || 0
    });
  }

  return result;
}