import type {BaseEntity} from "@/entity/BaseEntity.ts";

/**
 * WevDAV文件夹
 */
export interface FolderWebDav extends BaseEntity {

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
  auth_type: 'auto' | 'digest' | 'none' | 'password' | 'token';

}