import {invoke} from "@tauri-apps/api/core";

export interface SmbOption {
  username: string;
  password: string;
  domain: string;
}

/**
 * 创建客户端
 * @param clientId 客户端 ID
 * @param option 连接选项
 */
export async function createSmbClient(clientId: string, option: SmbOption): Promise<void> {
  await invoke("create_smb_client", {clientId, option});
}

/**
 * 关闭客户端
 * @param clientId 客户端 ID
 */
export async function closeSmbClient(clientId: string): Promise<void> {
  await invoke("close_smb_client", {clientId});
}

/**
 * Smb 文件项
 */
export interface SmbFileItem {
  // 文件名
  filename: string;
  // 是否是文件
  isFile: boolean;
  // 是否是文件夹
  isDirectory: boolean;
  // 是否是符号链接
  isSymlink: boolean;
  /**
   * 文件大小（字节）。
   * 注意: 对于文件夹，这个值通常为 0 或无意义。
   */
  end_of_file: number;
  /**
   * 最后修改时间。
   * 格式: 通常是 Windows FILETIME (自 1601-01-01 以来的 100 纳秒间隔数)。你需要将其转换为 Unix 时间戳或 Rust 的 SystemTime 以便前端展示。
   */
  last_write_time: number;
  /**
   * 创建时间。
   */
  creation_time: number;
  /**
   * 最后访问时间。
   */
  last_access_time: number;
  /**
   * 文件的唯一标识符（Inode 类似物）。
   * 用途: 用于后续快速打开文件而不需要再次解析路径，或者用于去重。
   */
  file_id: string;
}

/**
 * 读取目录
 * @param clientId 客户端 ID
 * @param path 目录路径，unc 的相对目录
 */
export async function readSmbDir(clientId: string, path: string): Promise<Array<SmbFileItem>> {
  return await invoke("read_smb_dir", {clientId, path});
}