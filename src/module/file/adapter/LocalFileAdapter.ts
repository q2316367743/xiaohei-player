import type {FileBrowser, FileItem} from "@/module/file/types.ts";
import {readDir} from "@tauri-apps/plugin-fs";
import {extname, joinPath} from "@/util/lang/FileUtil.ts";
import type {FolderViewCoreLocal} from "@/entity/main/Folder.ts";
import {convertFileSrcToUrl} from "@/lib/FileSrc.ts";

export class LocalFileAdapter implements FileBrowser {

  private readonly base: string;

  constructor(prop: FolderViewCoreLocal) {
    this.base = prop.path;
  }


  getLink(path: string): string {
    const target = joinPath(this.base, path);
    return convertFileSrcToUrl(target);
  }

  async list(path: string): Promise<FileItem[]> {
    const target = joinPath(this.base, path);
    const items = await readDir(target);
    return items.map(e => {
      const p = joinPath(target, e.name).substring(this.base.length)
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