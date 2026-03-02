import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface FolderLocalCore {
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

/**
 * 本地文件夹
 */
export interface FolderLocal extends BaseEntity, FolderLocalCore {

}