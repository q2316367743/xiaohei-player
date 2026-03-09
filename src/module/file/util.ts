import {sep} from "@tauri-apps/api/path";
import type {FileBrowser, FileItem} from "@/module/file/types.ts";

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

export function filterVideoFileList(files: Array<FileItem>, folderExtname: Array<string>, adapter: FileBrowser): Array<FileItem> {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

  return files.filter(item => {
    if (item.isDirectory) {
      return true;
    }
    const ext = item.extname.toLowerCase().replace('.', '');
    return folderExtname.includes(ext);
  }).map(item => {
    if (item.isDirectory) {
      return item;
    }

    const nameWithoutExt = item.name.substring(0, item.name.lastIndexOf('.'));
    const sameFolderFiles = files.filter(f => f.folder === item.folder);

    let coverFile: FileItem | null = null;

    for (const file of sameFolderFiles) {
      if (!file.isFile) continue;

      const fileExt = file.extname.toLowerCase().replace('.', '');
      if (!imageExtensions.includes(fileExt)) continue;

      const fileWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));

      if (fileWithoutExt === nameWithoutExt) {
        coverFile = file;
        break;
      }

      if (fileWithoutExt === `${nameWithoutExt}-poster`) {
        coverFile = file;
        break;
      }

      if (fileWithoutExt === `${nameWithoutExt}-thumbs`) {
        coverFile = file;
        break;
      }
    }

    return {
      ...item,
      cover: coverFile ? adapter.getLink(coverFile.path) : undefined
    };
  });
}