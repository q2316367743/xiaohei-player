import type {FileBrowser, FileItem} from "@/module/file";
import type {FolderViewCoreSmb} from "@/entity/main/Folder.ts";
import {createSmbClient, readSmbDir} from "@/lib/smb.ts";
import {extname} from "@/util/lang/FileUtil.ts";
import {convertSmbToUrl} from "@/lib/FileSrc.ts";

export class SmbFileAdapter implements FileBrowser {
  private readonly id: string;
  private readonly option: FolderViewCoreSmb;
  constructor(id : string, option: FolderViewCoreSmb) {
    this.id = id;
    this.option = option;
  }

  async init(): Promise<void> {
    await createSmbClient(this.id, this.option.payload);
  }

  private uncPathToUnix(path: string): string {
    // unc 路径转为 unix 路径
    return path.replace(/\\/g, "/");
  }

  private unixPathToUnc(path: string): string {
    // unix 路径转为 unc 路径
    return path.replace(/\//g, "\\");
  }

  getLink(path: string): string {
    // unix 路径转为 unc 路径
    const unc = this.unixPathToUnc(path);
    return convertSmbToUrl(unc, this.id);
  }

  async list(path: string): Promise<FileItem[]> {
    const unc = this.unixPathToUnc(path);
    const list = await readSmbDir(this.id, unc);
    return list.map(item => ({
      name: item.filename,
      extname: extname(item.filename),
      path: this.uncPathToUnix(path + '\\' + item.filename),
      folder: path,
      isFile: item.isFile,
      isDirectory: item.isDirectory,
      isSymlink: item.isSymlink,
    }));
  }

}