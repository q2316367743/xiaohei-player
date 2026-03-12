import {join} from "@tauri-apps/api/path";
import {exists, remove} from "@tauri-apps/plugin-fs";
import {logDebug, logError} from "@/lib/log.ts";
import {generateCover, generatePreview, generateVtt, getVideoInfo} from "@/module/library/command/FfmpegCommand.ts";
import type {SystemSetting} from "@/entity/setting/SystemSetting.ts";
import type {TaskSetting} from "@/entity/setting/TaskSetting.ts";
import type {VideoInfo} from "@/entity/domain/Video.ts";
import type {ScanVideoFile} from "@/module/library/types.ts";

interface GenerateLibraryOneProp {
  system: SystemSetting;
  task: TaskSetting;
  hash: string;
  file: ScanVideoFile;
  vttPrefixDir: string;
  screenshotDir: string;
  coverDir: string;
  existingCover: string;
}

interface GenerateLibraryOneResult extends VideoInfo {
  // 封面地址
  cover_path: string | undefined;
  // 片段
  sprite_path: string | undefined;
  // 时间轴预览小图
  vtt_path: string | undefined;
  // 预览视频地址
  screenshot_path: string | undefined;
}


async function handleVideoInfo(props: GenerateLibraryOneProp): Promise<VideoInfo> {
  const {file, system} = props;
  const {filePath, fileName} = file;

  let videoInfo: VideoInfo = {
    duration_ms: 0,
    width: 0,
    height: 0,
    fps: 0,
    bit_rate: 0,
    video_codec: "",
    audio_codec: "",
    container_format: ""
  };

  try {
    videoInfo = await getVideoInfo(system.ffprobePath, filePath);
    logDebug("获取视频信息成功:", fileName, videoInfo);
  } catch (e) {
    logError("视频文件损坏或无法读取，跳过:", fileName, e);
  }
  return videoInfo;
}

interface HandleVttResult {
  sprite_path: string | undefined,
  vtt_path: string | undefined
}

async function handleVtt(props: GenerateLibraryOneProp, durationMs: number, videoInfo: VideoInfo): Promise<HandleVttResult> {
  const {hash, file, vttPrefixDir, system, task} = props;
  const {filePath, fileName} = file;

  // 不生成 vtt
  if (!task.timelinePreviewThumbnail) return {sprite_path: undefined, vtt_path: undefined};

  const vttPrefixPath = await join(vttPrefixDir, hash);

  logDebug("生成字幕文件:", vttPrefixPath);
  const sprite = vttPrefixPath + "_sprite.jpg";
  const vtt = vttPrefixPath + "_thumbs.vtt";

  let sprite_path: string | undefined = undefined;
  let vtt_path: string | undefined = undefined;
  // 需要生成预览小图
  try {
    const existSprite = await exists(sprite);
    const existVtt = await exists(vtt);
    if (!task.overwriteExistingFile) {
      // 不覆盖
      if (existSprite && existVtt) {
        // 文件还存在，直接返回
        return {sprite_path: sprite, vtt_path: vtt};
      }
    }
    // 覆盖或者文件不全
    if (existSprite) await remove(sprite);
    if (existVtt) await remove(vtt);
    // 生成预览小图
    await generateVtt({
      ffmpeg: system.ffmpegPath,
      durationMs: durationMs,
      path: filePath,
      sprite,
      vtt,
      videoInfo
    });
    sprite_path = sprite;
    vtt_path = vtt;
  } catch (e) {
    logError("生成字幕文件失败，跳过:", fileName, e);
  }
  return {
    sprite_path,
    vtt_path
  }
}

async function handleScreenshot(props: GenerateLibraryOneProp, duration_ms: number): Promise<string | undefined> {
  const {hash, file, screenshotDir, system, task} = props;
  const {filePath, fileName} = file;

  // 不生成预览视频
  if (!task.preview) return undefined;

  const screenshotPath = await join(screenshotDir, hash + '.mp4');
  const existPreview = await exists(screenshotPath);
  // 存在预览视频
  if (existPreview) {
    // 需要覆盖
    if (task.overwriteExistingFile) {
      // 删除旧的视频
      await remove(screenshotPath);
    } else {
      // 不覆盖，直接返回
      return screenshotPath;
    }
  }

  try {
    logDebug("生成预览视频:", screenshotPath);
    await generatePreview({
      ffmpeg: system.ffmpegPath,
      path: filePath,
      preview: screenshotPath,
      durationMs: duration_ms,
      previewSetting: system.preview
    });
    return screenshotPath;
  } catch (e) {
    logError("生成预览视频失败，跳过:", fileName, e);
  }
  return undefined;
}

async function handleCover(props: GenerateLibraryOneProp): Promise<string | undefined> {
  const {hash, file, system, task, coverDir, existingCover} = props;
  const {filePath} = file;

  // 已经解析到封面了
  if (existingCover) return existingCover;

  // 没有解析到，需要生成封面
  const coverPath = await join(coverDir, hash + '.jpg');
  const existCover = await exists(coverPath);
  if (existCover) {
    // 存在封面
    if (task.overwriteExistingFile) {
      // 删除旧封面
      await remove(coverPath);
    } else {
      // 存在封面但不覆盖，直接返回
      return coverPath;
    }
  }
  await generateCover(system.ffmpegPath, filePath, coverPath);
  return coverPath;
}

export async function generatorLibrary(props: GenerateLibraryOneProp): Promise<GenerateLibraryOneResult> {

  const videoInfo = await handleVideoInfo(props);
  const [{vtt_path, sprite_path}, screenshot_path, cover_path] = await Promise.all([
    handleVtt(props, videoInfo.duration_ms, videoInfo),
    handleScreenshot(props, videoInfo.duration_ms),
    handleCover(props)
  ]);

  return {
    ...videoInfo,
    sprite_path,
    vtt_path,
    screenshot_path,
    cover_path
  }
}
