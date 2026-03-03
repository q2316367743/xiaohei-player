export * from "./types.ts";
import {LocalFileAdapter}from "./adapter/LocalFileAdapter.ts";
import {WebDAVFileAdapter} from "./adapter/WebDAVFileAdapter.ts";
import type {FileBrowser} from "@/module/file/types.ts";
import type {FolderView} from "@/entity/domain/Folder.ts";


export function createFileAdapter(data: FolderView): FileBrowser {
  switch (data.type) {
    case 'local':
      return new LocalFileAdapter(data);
    case 'webdav':
      return new WebDAVFileAdapter(data);
    default:
      throw new Error("不支持的文件适配器类型");
  }
}
