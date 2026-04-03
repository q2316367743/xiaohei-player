import type {LibraryEntity} from "@/entity/main/LibraryEntity.ts";
import type {LibrarySetting} from "@/entity/setting/LibrarySetting.ts";
import {logDebug, logError, logTrace} from "@/lib/log.ts";
import {readDir, type DirEntry} from "@tauri-apps/plugin-fs";
import type {ScanVideoFile} from "@/module/library/types.ts";
import {getFilename, isFilenameMatch, parseFilename} from "@/util/lang/FileUtil.ts";
import {joinPath} from "@/util/lang/FileUtil.ts";
import type {CommonOption} from "@/global/CommonType.ts";

const IMAGE_EXTENSIONS = [/\.jpg$/, /\.jpeg$/, /\.png$/, /\.gif$/, /\.webp$/, /\.bmp$/];
const CAPTION_EXTENSIONS = [/\.srt$/, /\.ass$/, /\.ssa$/, /\.sub$/, /\.vtt$/];

const LANGUAGE_MAP: Record<string, string> = {
  'zh': '中文',
  'zh-cn': '简体中文',
  'zh-tw': '繁体中文',
  'chs': '简体中文',
  'cht': '繁体中文',
  'chinese': '中文',
  'en': '英文',
  'eng': '英文',
  'english': '英文',
  'ja': '日文',
  'jpn': '日文',
  'japanese': '日文',
  'ko': '韩文',
  'kor': '韩文',
  'korean': '韩文',
};

function findFileWrap(filename: string, dir: string, fileMap: Map<string, Array<DirEntry>>) {
  if (fileMap.has(filename)) {
    const files = fileMap.get(filename) || [];
    for (const file of files) {
      if (isFilenameMatch(file.name, IMAGE_EXTENSIONS)) {
        return joinPath(dir, file.name);
      }
    }
  }
}

export function findCoverFile(dir: string, filename: string, fileMap: Map<string, Array<DirEntry>>): string {

  // 1. cover的图片
  const cover1 = findFileWrap('cover', dir, fileMap);
  if (cover1) return cover1;
  // 2. poster 图片
  const cover2 = findFileWrap('poster', dir, fileMap);
  if (cover2) return cover2;
  // 3. filename-poster 图片
  const cover3 = findFileWrap(`${filename}-poster`, dir, fileMap);
  if (cover3) return cover3;
  // 4. filename-thumbs 图片
  const cover4 = findFileWrap(`${filename}-thumbs`, dir, fileMap);
  if (cover4) return cover4;

  return '';
}

export async function findNfoFile(dir: string, fileName: string, fileMap: Map<string, Array<DirEntry>>): Promise<string> {

  // movie.nfo
  if (fileMap.has('movie')) {
    const files = fileMap.get('movie') || [];
    for (const file of files) {
      if (isFilenameMatch(file.name, [/\.nfo$/])) {
        return joinPath(dir, file.name);
      }
    }
  }
  // filename.nfo
  if (fileMap.has(fileName)) {
    const files = fileMap.get(fileName) || [];
    for (const file of files) {
      if (isFilenameMatch(file.name, [/\.nfo$/])) {
        return joinPath(dir, file.name);
      }
    }
  }

  return '';
}

/**
 * 构建 文件名=>同文件名的文件 映射
 * @param files
 */
export function buildDirEntryMap(files: Array<DirEntry>): Map<string, Array<DirEntry>> {
  const map = new Map<string, Array<DirEntry>>();
  for (const file of files) {
    const nameWithoutExt = getFilename(file.name)
    if (map.has(nameWithoutExt)) {
      map.get(nameWithoutExt)?.push(file);
    } else {
      map.set(nameWithoutExt, [file]);
    }
  }
  return map;
}

function parseCaptionLabel(videoFilename: string, captionFilename: string): string {
  if (videoFilename === captionFilename) {
    return '默认';
  }

  const suffix = captionFilename.substring(videoFilename.length);
  const langCode = suffix.replace(/^[._-]/, '').toLowerCase();

  if (LANGUAGE_MAP[langCode]) {
    return LANGUAGE_MAP[langCode];
  }

  return langCode || '默认';
}

/**
 * 寻找字幕文件
 * @param dir 所在目录
 * @param filename 视频文件名（不包含扩展名）
 * @param files 目录下的所有文件
 */
export function findCaption(dir: string, filename: string, files: Array<DirEntry>): Array<CommonOption> {
  const captions: Array<CommonOption> = [];

  for (const file of files) {
    if (!file.isFile) continue;
    if (!isFilenameMatch(file.name, CAPTION_EXTENSIONS)) continue;

    const captionFilename = getFilename(file.name);
    if (!captionFilename.includes(filename)) continue;

    const label = parseCaptionLabel(filename, captionFilename);
    captions.push({
      label,
      value: joinPath(dir, file.name)
    });
  }

  return captions;
}

/**
 * 扫描视频文件
 * @param item 媒体库
 * @param library 媒体库设置
 * @param foundFiles 找到的文件
 */
export async function collectVideoFiles(
  item: LibraryEntity,
  library: LibrarySetting,
  foundFiles: Map<string, ScanVideoFile>
) {
  const {path} = item;
  logDebug("开始扫描目录:", path);
  const files = await readDir(path);
  logTrace("目录", path, "包含", files.length, "个文件/文件夹");

  const fileMap = buildDirEntryMap(files.filter(e => e.isFile));

  for (const file of files) {
    try {
      const newPath = joinPath(path, file.name);
      if (file.isDirectory) {
        logDebug("进入子目录:", newPath);
        await collectVideoFiles({...item, path: newPath}, library, foundFiles);
      } else if (file.isFile) {
        const [filename, extname] = parseFilename(file.name);
        if (!library.scanExtname.includes(extname)) {
          logTrace("跳过非视频文件:", file.name, "扩展名:", extname);
          continue;
        }

        foundFiles.set(newPath, {
          item: item,
          fileDir: path,
          filePath: newPath,
          fileName: file.name,
          // 字幕
          caption: findCaption(path, filename, files),
          cover: findCoverFile(path, filename, fileMap),
          nfo: await findNfoFile(path, filename, fileMap)
        });
        logTrace("发现视频文件:", file.name);

      }
    } catch (e) {
      logError("扫描目录时出错:", path, e);
    }
  }

  logDebug("目录扫描完成:", path);
}