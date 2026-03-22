import {sep} from "@tauri-apps/api/path";
import { platform } from "@tauri-apps/plugin-os";

export const separator = sep();

export const isWindows = platform() === 'windows'

/**
 * 拼接路径
 * @param paths 路径片段
 */
export function joinPath(...paths: string[]): string {
  return paths.filter(Boolean).join(separator).replace(/\/{2,}/g, '/');
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


/**
 * 获取没有拓展名的文件名
 */
export function getFilename(basename: string) {
  const index = basename.lastIndexOf('.');
  if (index >= 0) {
    return basename.substring(0, index);
  }
  return basename;
}

export function parseFilename(basename: string): [string, string] {
  const index = basename.lastIndexOf('.');
  if (index >= 0) {
    return [basename.substring(0, index), basename.substring(index + 1)];
  }
  return [basename, ''];
}

/**
 * 判断文件名是否匹配正则数组
 * @param basename 文件名
 * @param regexArray 正则数组
 */
export function isFilenameMatch(basename: string, regexArray: Array<RegExp>) {
  return regexArray.filter(regex => regex.test(basename)).length > 0;
}