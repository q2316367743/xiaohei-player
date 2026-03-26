import dayjs from "dayjs";

/**
 * 格式化日期
 * @param date 日期对象
 * @param format 格式字符串，YYYY-MM-DD HH:mm:ss
 */
export function formatDate(date: Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs(date).format(format);
}

/**
 * 格式化时间长度
 * @param duration 持续毫秒数
 */
export function formatDuration(duration: number) {
  // 几秒钟
  if (duration < 60_000) {
    return `${Math.floor(duration / 1000)}秒`;
  } else if (duration < 3600_000) {
    return `${Math.floor(duration / 60_000)}分钟${Math.floor(duration / 1000) % 60}秒`;
  } else if (duration < 86400_000) {
    return `${Math.floor(duration / 3600_000)}小时 ${Math.floor(duration / 60_000) % 60}分钟 ${Math.floor(duration / 1000) % 60}秒`;
  }
  return `${Math.floor(duration / 86400_000)}天 ${Math.floor(duration / 3600_000) % 24}小时 ${Math.floor(duration / 60_000) % 60}分钟 ${Math.floor(duration / 1000) % 60}秒`;
}


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

/**
 * 美化数据单位
 *
 * @param {number} value 需要美化的值
 */
export function prettyDataUnit(value: number) {
  const gb = 1024 * 1024 * 1024.0;
  if (value > gb) {
    const temp = value / gb;
    return temp.toFixed(2) + "GB";
  }
  const mb = 1024 * 1024.0;
  if (value > mb) {
    const temp = value / mb;
    return temp.toFixed(2) + "MB";
  }
  const b = 1024.0;
  if (value > b) {
    const temp = value / b;
    return temp.toFixed(2) + "KB";
  }
  return value + "B";
}
