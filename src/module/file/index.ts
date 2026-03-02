import type {FolderLocal} from "@/entity/domain/FolderLocal.ts";
import type {FolderWebDav} from "@/entity/domain/FolderWebDav.ts";

export * from "./types.ts";
import {LocalFileAdapter}from "./adapter/LocalFileAdapter.ts";
import {WebDAVFileAdapter} from "./adapter/WebDAVFileAdapter.ts";
import type {FileBrowser} from "@/module/file/types.ts";

export type FileAdapterType = 'local' | 'webdav';
export interface FileAdapterMap  {
  local: FolderLocal,
  webdav: FolderWebDav
}

export function createFileAdapter<T extends FileAdapterType>(type: T, prop: FileAdapterMap[T]): FileBrowser {
  switch (type) {
    case 'local':
      return new LocalFileAdapter(prop as FolderLocal);
    case 'webdav':
      return new WebDAVFileAdapter(prop as FolderWebDav);
    default:
      throw new Error("不支持的文件适配器类型");
  }
}
