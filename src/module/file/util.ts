import type {FileBrowser, FileItem} from "@/module/file/types.ts";

export function filterVideoFileList(files: Array<FileItem>, folderExtname: Array<string>, adapter: FileBrowser): Array<FileItem> {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

  return files.filter(item => {
    if (item.isDirectory) {
      return true;
    }
    const ext = item.extname.toLowerCase().replace('.', '');
    return folderExtname.includes(ext);
  }).map(item => {
    if (item.isDirectory) {
      return item;
    }

    const nameWithoutExt = item.name.substring(0, item.name.lastIndexOf('.'));
    const sameFolderFiles = files.filter(f => f.folder === item.folder);

    let coverFile: FileItem | null = null;

    for (const file of sameFolderFiles) {
      if (!file.isFile) continue;

      const fileExt = file.extname.toLowerCase().replace('.', '');
      if (!imageExtensions.includes(fileExt)) continue;

      const fileWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));

      if (fileWithoutExt === nameWithoutExt) {
        coverFile = file;
        break;
      }

      if (fileWithoutExt === `${nameWithoutExt}-poster`) {
        coverFile = file;
        break;
      }

      if (fileWithoutExt === `${nameWithoutExt}-thumbs`) {
        coverFile = file;
        break;
      }
    }

    return {
      ...item,
      cover: coverFile ? adapter.getLink(coverFile.path) : undefined
    };
  });
}