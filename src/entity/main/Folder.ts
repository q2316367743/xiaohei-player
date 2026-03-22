import type {BaseEntity} from "@/entity/BaseEntity.ts";

export type FolderType = 'local' | 'webdav' | 'smb' | 'open_list';
export type FolderWebdavType = 'auto' | 'digest' | 'none' | 'password' | 'token';

export type FolderPayloadLocal = object

export interface FolderPayloadWebdav {

  /**
   * 认证地址
   */
  auth_url: string;

  /**
   * 认证用户名
   */
  auth_username: string;

  /**
   * 认证密码
   */
  auth_password: string;

  /**
   * 认证类型
   */
  auth_type: FolderWebdavType;
}

export interface FolderCore {

  type: FolderType;

  /**
   * 文件夹名
   */
  name: string;

  /**
   * 文件夹路径
   */
  path: string;

  /**
   * 文件夹密码，md5格式，如果存在，则需要密码才可以访问
   */
  password: string;

  /**
   * 文件夹配置
   */
  payload: string;
}

export interface Folder extends BaseEntity, FolderCore {

}

interface FolderViewCoreBase {

  type: FolderType;

  /**
   * 文件夹名
   */
  name: string;

  /**
   * 文件夹路径
   */
  path: string;

  /**
   * 文件夹密码，md5格式，如果存在，则需要密码才可以访问
   */
  password: string;

}

export interface FolderViewCoreLocal extends FolderViewCoreBase {

  type: 'local';

  /**
   * 文件夹配置
   */
  payload: FolderPayloadLocal
}

export interface FolderViewCoreWebdav extends FolderViewCoreBase {

  type: 'webdav';

  /**
   * 文件夹配置
   */
  payload: FolderPayloadWebdav
}

export interface FolderPayloadSmb {
  username: string;
  password: string;
  domain: string;
  share: string;
}

export interface FolderViewCoreSmb extends FolderViewCoreBase {

  type: 'smb';

  /**
   * 文件夹配置
   */
  payload: FolderPayloadSmb
}

export interface FolderPayloadOpenList {
  type: 'basic' | 'token';
  username: string;
  password: string;
  token: string;
}

export interface FolderViewCoreOpenList extends FolderViewCoreBase {

  type: 'open_list';

  /**
   * 文件夹配置
   */
  payload: FolderPayloadOpenList
}

export type FolderViewCore = FolderViewCoreLocal | FolderViewCoreWebdav | FolderViewCoreSmb | FolderViewCoreOpenList;

export type FolderView = BaseEntity & FolderViewCore;

const buildFolderViewCoreLocal = (): FolderPayloadLocal => ({});
const buildFolderViewCoreWebdav = (): FolderPayloadWebdav => ({
  auth_url: '',
  auth_username: '',
  auth_password: '',
  auth_type: 'auto'
})
const buildFolderViewCoreSmb = (): FolderPayloadSmb => ({
  username: '',
  password: '',
  domain: '',
  share: ''
})
const buildFolderViewCoreOpenList = (): FolderPayloadOpenList => ({
  type: 'basic',
  username: '',
  password: '',
  token: ''
})

export function buildFolderViewCore(type: 'local'): FolderViewCoreLocal;
export function buildFolderViewCore(type: 'webdav'): FolderViewCoreWebdav;
export function buildFolderViewCore(type: 'smb'): FolderViewCoreSmb;
export function buildFolderViewCore(type: 'open_list'): FolderViewCoreOpenList;
export function buildFolderViewCore(type: FolderType): FolderViewCore {
  const base = {
    name: '',
    path: '',
    password: ''
  };
  switch (type) {
    case 'local':
      return {
        ...base,
        type: 'local',
        payload: buildFolderViewCoreLocal()
      };
    case 'webdav':
      return {
        ...base,
        type: 'webdav',
        payload: buildFolderViewCoreWebdav()
      };
    case 'smb':
      return {
        ...base,
        type: 'smb',
        payload: buildFolderViewCoreSmb()
      };
    case 'open_list':
      return {
        ...base,
        type: 'open_list',
        payload: buildFolderViewCoreOpenList()
      }
  }
}