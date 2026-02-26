import dayjs from "dayjs";

/**
 * 格式化日期
 * @param date 日期对象
 * @param format 格式字符串
 */
export function formatDate(date: Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs(date).format(format);
}

export const prettyBetweenTime = (timestamp: string | number | Date) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  return date.toLocaleDateString();
};


/**
 * 获取时间间隔文本
 * @param last_interaction 上次的时间戳
 * @returns {string} 时间间隔文本，易于理解，例如刚刚，1分钟前，1小时前，1天前，1周前，1个月前，1年前
 */
export function getTimeSinceLastInteraction(last_interaction: number): string {
  // If no previous interaction recorded, return a placeholder indicating no recent interaction
  if (!last_interaction || last_interaction <= 0) {
    return '很久以前';
  }

  const now = Date.now();
  let deltaMs = now - last_interaction;
  if (deltaMs < 0) deltaMs = 0;

  const s = Math.floor(deltaMs / 1000);
  if (s < 60) return '刚刚';

  const m = Math.floor(s / 60);
  if (m < 60) return `${m}分钟前`;

  const h = Math.floor(m / 60);
  if (h < 24) return `${h}小时前`;

  const d = Math.floor(h / 24);
  if (d < 7) return `${d}天前`;

  const w = Math.floor(d / 7);
  if (w < 5) return `${w}周前`;

  const mon = Math.floor(d / 30);
  if (mon < 12) return `${mon}月前`;

  const y = Math.floor(d / 365);
  return `${y}年前`;
}

/**
 * 美化聊天时间
 * - 今天：HH:mm
 * - 本年：MM-DD HH:mm
 * - 否则：YYYY-MM-DD HH:mm
 * @param timestamp
 */
export function prettyMessageDate(timestamp: string | number | Date) {
  const date = dayjs(timestamp);
  const now = dayjs();
  const isToday = date.isSame(now, 'day');
  if (isToday) {
    return date.format('HH:mm');
  }
  const isThisYear = date.isSame(now, 'year');
  if (isThisYear) {
    return date.format('MM-DD HH:mm');
  }
  return date.format('YYYY-MM-DD HH:mm');
}