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
