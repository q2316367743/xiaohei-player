/**
 * 仅替换字符串开头的指定子串
 * @param source 原始字符串
 * @param search 要查找的子串（仅匹配开头）
 * @param replacement 替换为的子串
 * @returns 替换后的字符串
 */
export function replaceStart(source: string, search: string, replacement: string): string {
  if (source.startsWith(search)) {
    return replacement + source.slice(search.length);
  }
  return source;
}

