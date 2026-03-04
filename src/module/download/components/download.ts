import {type DownloadResult, transferDrToNfo} from "@/module/download";
import {useDownloadSettingStore} from "@/store";
import {join} from "@/module/file/util.ts";
import {mkdir, writeTextFile} from "@tauri-apps/plugin-fs";
import {download} from '@tauri-apps/plugin-upload';
import {logDebug, logError} from "@/lib/log.ts";

function transferName(name: string): string {
  const n = name.replace(/#\S+/g, '').replace(/[<>:"/\\|?*]/g, '_').trim();
  return n || `${Date.now()}`;
}

interface ProgressPayload {
  progress: number;
  progressTotal: number;
  total: number;
  transferSpeed: number;
  title: string
}

type ProgressHandler = (progress: ProgressPayload) => void;

export async function pluginDownload(
  res: DownloadResult,
  progressHandler?: ProgressHandler) {
  // 获取平台
  const {platform} = res;
  const path = await useDownloadSettingStore().getPath(platform);


  // 将名字作为文件夹，并要转换
  const dirName = transferName(res.title);
  const dir = join(path, dirName);
  // 创建目录
  await mkdir(dir, {recursive: true});
  logDebug('[download] 开始下载', dir);
  // 获取 url 最后一项
  const u = new URL(res.url);
  const fileName = u.pathname.split('/').filter(Boolean).pop() || `${Date.now()}`;
  // 下载视频
  const videoPath = join(dir, `${fileName}.mp4`);
  logDebug('[download] 下载视频', videoPath);
  await download(res.video, videoPath, progressHandler ? p => progressHandler({
    ...p,
    title: '下载视频中...'
  }) : undefined);

  let coverPath: string | undefined = undefined;
  try {
    if (res.cover) {
      // 获取封面
      coverPath = join(dir, `${fileName}.jpg`);
      logDebug('[download] 下载封面', coverPath);
      await download(res.cover, coverPath, progressHandler ? p => progressHandler({
        ...p,
        title: '下载封面中...'
      }) : undefined);
    }
  } catch (e) {
    logError('[download] 下载封面失败', e);
  }
  try {
    // 下载 nfo
    progressHandler?.({
      progress: 99,
      progressTotal: 100,
      total: 100,
      transferSpeed: 0,
      title: '下载 nfo'
    })
    const nfoPath = join(dir, `${fileName}.nfo`);
    logDebug('[download] 写入 nfo', nfoPath);
    await writeTextFile(nfoPath, transferDrToNfo({
      cover: coverPath,
      title: res.title,
      description: res.description,
      author: res.author,
    }));
  } catch (e) {
    logError('[download] 写入 nfo 失败', e);
  }
}