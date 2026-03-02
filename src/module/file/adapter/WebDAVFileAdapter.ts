import type {FileBrowser, FileItem} from "@/module/file/types.ts";
import type {WebDAVClient} from "@/lib/webdav/types.ts";
import type {FolderWebDav} from "@/entity/domain/FolderWebDav.ts";
import {createWebDAVClient} from "@/lib/webdav";
import {convertWebDavToUrl} from "@/lib/FileSrc.ts";
import {extname} from "@/module/file/util.ts";

export class WebDAVFileAdapter implements FileBrowser {
  private readonly client: WebDAVClient;
  private readonly username: string;
  private readonly password: string;
  private readonly type: string;
  private readonly base: string

  constructor(prop: FolderWebDav) {
    this.client = createWebDAVClient(prop.auth_url, {
      authType: prop.auth_type,
      username: prop.auth_username,
      password: prop.auth_password
    });
    this.username = prop.auth_username;
    this.password = prop.auth_password;
    this.type = prop.auth_type;
    this.base = prop.path;
  }

  getLink(item: FileItem): string {
    if (!item.isFile) throw new Error("只能打开文件");
    const target = this.base + item.path;

    const url = this.client.getFileDownloadLink(target);
    return convertWebDavToUrl(url, this.username, this.password, this.type);
  }

  async list(path: string): Promise<FileItem[]> {
    const target = this.base + path;
    const items = await this.client.getDirectoryContents(target);
    return items.map(item => {
      return {
        name: item.basename,
        extname: extname(item.basename),
        path: item.filename.substring(this.base.length),
        folder: target,
        isSymlink: false,
        isFile: item.type === 'file',
        isDirectory: item.type === 'directory'
      }
    })
  }

}