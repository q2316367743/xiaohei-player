import type {FileBrowser, FileItem} from "@/module/file/types.ts";
import {readDir, stat} from "@tauri-apps/plugin-fs";
import {extname, isWindows, joinPath} from "@/util/lang/FileUtil.ts";
import type {FolderViewCoreLocal} from "@/entity/main/Folder.ts";
import {convertFileSrcToUrl} from "@/lib/FileSrc.ts";
import {logError} from "@/lib/log.ts";

export class LocalFileAdapter implements FileBrowser {

  private readonly base: string;

  constructor(prop: FolderViewCoreLocal) {
    this.base = prop.path;
  }

  async init(): Promise<void> {
  }


  async getLink(path: string) {
    if (isWindows) {
      path = path.replace('/', "\\");
    }
    const target = joinPath(this.base, path);
    return convertFileSrcToUrl(target);
  }

  async list(path: string): Promise<FileItem[]> {
    if (isWindows) {
      path = path.replace('/', "\\");
    }
    if (path === '/') {
      path = '';
    }
    const target = joinPath(this.base, path);
    console.log(this.base, path, target)
    const items = await readDir(target);
    const results: FileItem[] = [];
    for (const e of items) {
      if (e.name.startsWith(".")) {
        // 忽略隐藏文件
        continue;
      }

      const fullPath = joinPath(target, e.name);
      const p = fullPath.substring(this.base.length);
      let size = 0;
      let created = 0;
      try {
        if (e.isFile) {
          const s = await stat(fullPath);
          size = s.size;
          created = s.birthtime?.getTime() || 0;
        }
      }catch (err) {
        logError(`获取文件「${fullPath}」状态错误`, err);
      }
      results.push({
        name: e.name,
        extname: extname(e.name),
        path: isWindows ? p.replace("\\", "/") : p,
        folder: target,

        size,
        created,
        sign: p,

        isFile: e.isFile,
        isDirectory: e.isDirectory,
        isSymlink: e.isSymlink
      });
    }
    return results;
  }

}