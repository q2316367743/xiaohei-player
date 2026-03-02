import {sep} from "@tauri-apps/api/path";

const separator = sep();

/**
 * 拼接路径
 * @param paths 路径片段
 */
export function join(...paths: string[]): string {
  const hasRoot = paths.length > 0 && paths[0]?.startsWith(separator);
  return paths
    .filter(Boolean)
    .map(path => path.replace(new RegExp(`^\\${separator}|\\${separator}$`, 'g'), ''))
    .filter(Boolean)
    .join(separator)
    .replace(/^/, hasRoot ? separator : '');
}

/**
 * 正规化路径
 * @param path
 */
export function normalize(path: string): string {
  return path.replace(new RegExp(`\\${separator}{2,}`, 'g'), separator);
}

/**
 * 获取路径的父目录
 * @param path
 */
export function dirname(path: string): string {
  const normalized = normalize(path);
  const parts = normalized.split(separator);
  parts.pop();
  const result = parts.join(separator);
  if (!result) {
    return separator === '/' ? '/' : '';
  }
  return result;
}

/**
 * 获取路径的文件名
 * @param path
 */
export function basename(path: string): string {
  const normalized = normalize(path);
  const parts = normalized.split(separator);
  return parts[parts.length - 1] || '';
}

/**
 * 获取路径的文件扩展名
 * @param path
 */
export function extname(path: string): string {
  const filename = basename(path);
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1 || dotIndex === 0) return '';
  return filename.slice(dotIndex);
}