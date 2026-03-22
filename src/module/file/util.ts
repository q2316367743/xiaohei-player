import type {FileItem} from "@/module/file/types.ts";

export async function filterVideoFileList(files: Array<FileItem>, folderExtname: Array<string>): Promise<Array<FileItem>> {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

  const items = files.filter(item => {
    if (item.isDirectory) {
      return true;
    }
    const ext = item.extname.toLowerCase().replace('.', '');
    return folderExtname.includes(ext);
  });
  const results = new Array<FileItem>();
  for (const item of items) {
    if (item.isDirectory) {
      results.push(item);
      continue;
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

    results.push({
      ...item,
      cover: coverFile?.path
    })
  }
  return results;
}