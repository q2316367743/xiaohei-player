export interface FileItem {
  // 文件名，带扩展名
  name: string;
  extname: string;
  path: string;
  folder: string;
  isFile: boolean;
  isDirectory: boolean;
  isSymlink: boolean;

  // 封面路径
  cover?: string;
}

export interface FileBrowser {

  init(): Promise<void>;

  list(path: string): Promise<FileItem[]>;

  getLink(path: string): string;

}