import type {FileBrowser, FileItem} from "@/module/file/types.ts";
import {convertFileSrcToUrl} from "@/lib/FileSrc.ts";
import {readDir} from "@tauri-apps/plugin-fs";
import {join, extname} from "@/module/file/util.ts";
import type {FolderViewCoreLocal} from "@/entity/domain/Folder.ts";

export class LocalFileAdapter implements FileBrowser {

  private readonly base: string;

  constructor(prop: FolderViewCoreLocal) {
    this.base = prop.path;
  }


  getLink(item: FileItem): string {
    if (!item.isFile) throw new Error("只能打开文件");
    const target = join(this.base, item.path);
    return convertFileSrcToUrl(target);
  }

  async list(path: string): Promise<FileItem[]> {
    const target = join(this.base, path);
    const items = await readDir(target);
    return items.map(e => {
      const p = join(target, e.name).substring(this.base.length)
      return {
        name: e.name,
        extname: extname(e.name),
        path: p,
        folder: target,
        isFile: e.isFile,
        isDirectory: e.isDirectory,
        isSymlink: e.isSymlink
      }
    })
  }

}