/**
 * 删除对象中的空值
 * @param obj
 * @param filter
 */
export const shake = (
  obj: Record<string, any>,
  filter?: (value: any) => boolean
): Record<string, string> => {
  if (!filter) {
    filter = (e) => e === undefined;
  }
  if (!obj) return {};
  const keys = Object.keys(obj);
  return keys.reduce(
    (acc, key) => {
      if (filter(obj[key])) {
        return acc;
      } else {
        acc[key] = obj[key];
        return acc;
      }
    },
    {} as Record<string, any>
  );
};

/**
 * 获取链接的标题
 * @param url 链接
 */
export const parseUrlTitle = (url: string) => {
  // 获取url的标题
  const u = new URL(url);
  const title = u.pathname.split("/").filter(Boolean).pop();
  return title || `${Date.now()}`;
}