import type {FileBrowser, FileItem} from "@/module/file/types.ts";
import type {WebDAVClient} from "@/lib/webdav/types.ts";
import {createWebDAVClient} from "@/lib/webdav";
import {convertWebDavToUrl} from "@/lib/FileSrc.ts";
import {extname} from "@/util/lang/FileUtil.ts";
import type {FolderViewCoreWebdav} from "@/entity/main/Folder.ts";

export class WebDAVFileAdapter implements FileBrowser {
  private readonly client: WebDAVClient;
  private readonly username: string;
  private readonly password: string;
  private readonly type: string;
  private readonly base: string

  constructor(prop: FolderViewCoreWebdav) {
    this.client = createWebDAVClient(prop.payload.auth_url, {
      authType: prop.payload.auth_type,
      username: prop.payload.auth_username,
      password: prop.payload.auth_password
    });
    this.username = prop.payload.auth_username;
    this.password = prop.payload.auth_password;
    this.type = prop.payload.auth_type;
    this.base = prop.path;
  }

  async init(): Promise<void> {
  }

  getLink(path: string): string {
    const target = this.base + path;

    const url = this.client.getFileDownloadLink(target);
    return convertWebDavToUrl('xxx.mp4', url, this.username, this.password, this.type);
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