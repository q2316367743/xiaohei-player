import type {FileBrowser, FileItem} from "@/module/file";
import type {FolderViewCoreOpenList} from "@/entity";
import {postAction} from "@/lib/http.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {extname, joinPath} from "@/util/lang/FileUtil.ts";

interface OpenListResp<T> {
  code: number;
  message: string;
  data: T;
}

interface OpenListFsResp {
  content?: FsObject[];
  /**
   * Header content
   */
  header?: string;
  /**
   * Storage provider name
   */
  provider?: string;
  /**
   * README content (if exists)
   */
  readme?: string;
  /**
   * Total number of items
   */
  total?: number;
  /**
   * Whether current user has write permission
   */
  write?: boolean;
}

/**
 * FsObject
 */
interface FsObject {
  /**
   * Creation time
   */
  created?: number;
  /**
   * Parsed hash information
   */
  hash_info?: { [key: string]: string } | null;
  /**
   * Hash information (JSON string or "null")
   */
  hashinfo?: string;
  /**
   * Object ID (may be empty for local storage)
   */
  id?: string;
  /**
   * Whether this is a directory
   */
  is_dir?: boolean;
  /**
   * Last modified time
   */
  modified?: Date;
  mount_details?: null | StorageDetails;
  /**
   * File or directory name
   */
  name: string;
  /**
   * Full system path
   */
  path?: string;
  /**
   * Signature for download authentication
   */
  sign?: string;
  /**
   * File size in bytes (0 for directories)
   */
  size?: number;
  /**
   * Thumbnail URL (if available)
   */
  thumb?: string;
  /**
   * File type:
   * 0=Unknown, 1=Folder, 2=Video, 3=Audio, 4=Text, 5=Image
   */
  type?: number;
}

interface StorageDetails {
  /**
   * Storage driver name
   */
  driver_name?: string;
  /**
   * Free storage space in bytes
   */
  free_space?: number;
  /**
   * Total storage space in bytes
   */
  total_space?: number;
}

interface FsGetObject {
  name: string;
  size: number;
  is_dir: boolean;
  modified: string;
  created: string;
  sign: string;
  thumb: string;
  type: number;
  hashinfo: string;
  hash_info?: any;
  raw_url: string;
  readme: string;
  header: string;
  provider: string;
  related: Related[];
}

interface Related {
  name: string;
  size: number;
  is_dir: boolean;
  modified: string;
  created: string;
  sign: string;
  thumb: string;
  type: number;
  hashinfo: string;
  hash_info?: any;
}

export class OpenListFileAdapter implements FileBrowser {
  private readonly option: FolderViewCoreOpenList;
  private readonly id: string;
  private token = '';

  constructor(id: string, option: FolderViewCoreOpenList) {
    this.id = id;
    this.option = option;
  }

  async init(): Promise<void> {
    const {payload} = this.option;
    const key = `/file/${this.id}/token`;
    if (payload.type === 'basic') {
      const tokenOld = localStorage.getItem(key);
      if (tokenOld) {
        this.token = tokenOld;
        return;
      }
      // 基础认证
      const resp = await postAction<OpenListResp<{ token: string }>>('/api/auth/login', {
        username: payload.username,
        password: payload.password,
        otp_code: ""
      });
      const {code, data} = resp.data;
      // 如果返回 402 则需要输入 opt 码
      if (code === 402) {
        // 输入 opt
        const opt_code = MessageBoxUtil.prompt("请输入 opt 码", "OTP 码", {
          inputValue: "",
          confirmButtonText: "确定",
          cancelButtonText: "取消",
        })
        // 重新请求
        const optLoginResp = await postAction<OpenListResp<{ token: string }>>('/api/auth/login', {
          username: payload.username,
          password: payload.password,
          otp_code: opt_code
        });
        // 设置 token
        this.token = optLoginResp.data.data.token;
        localStorage.setItem(key, data.token);
        return;
      }
      // 设置 token
      this.token = data.token;
      localStorage.setItem(key, data.token);
    } else if (payload.type === 'token') {
      this.token = payload.token;
    }
  }

  async getLink(path: string) {
    const resp = await postAction<OpenListResp<FsGetObject>>('/api/fs/get', {
      path: path,
      password: ""
    }, {headers: {'Authorization': this.token}});
    return resp.data.data.raw_url;
  }

  async list(path: string): Promise<FileItem[]> {
    const resp = await postAction<OpenListResp<OpenListFsResp>>('/api/file/list', {
      "path": path,
      "password": "",
      "refresh": false,
      "page": 1,
      "per_page": 30
    }, {headers: {'Authorization': this.token}}).then(resp => {
      return resp.data.data;
    });
    const {content} = resp;
    if (!content) return [];
    return content.map(item => {
      return {
        name: item.name,
        extname: extname(item.name),
        path: joinPath(path, item.name),
        folder: path,

        size: item.size,
        sign: item.sign,
        created: item.created || 0,

        isFile: !item.is_dir,
        isDirectory: item.is_dir,
        isSymlink: false,

        cover: item.thumb
      } as FileItem;
    })
  }


}