import {invoke} from "@tauri-apps/api/core";
import {mkdir, writeFile, remove} from '@tauri-apps/plugin-fs';
import {dirname, join, tempDir} from "@tauri-apps/api/path";
import type {VideoInfo} from "@/entity/domain/Video.ts";
import type {SystemPreviewSetting} from "@/entity/setting/SystemSetting.ts";

function execFfmepgCommand(ffmpeg: string, args: Array<string>, timeoutMs: number = 30000) {
  const commandPromise = invoke<string>("ffmpeg_command", {
    cmd: ffmpeg,
    args
  });

  if (!timeoutMs) {
    return commandPromise;
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`FFmpeg command timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([commandPromise, timeoutPromise]);
}

async function ensureDir(filePath: string) {
  const dir = await dirname(filePath);
  try {
    await mkdir(dir, {recursive: true});
  } catch {
    // 目录可能已存在，忽略错误
  }
}

interface GenerateVttProp {
  ffmpeg: string;
  durationMs: number;
  // 视频路径
  path: string;
  sprite: string;
  vtt: string;
}

/**
 * 生成vtt图片，一共两个文件，一个 jpg 图片，是 9x9 的图片，另一个是 vtt 文件，记录着每一个图片的时间轴信息。
 */
export async function generateVtt(prop: GenerateVttProp) {
  const {ffmpeg, durationMs, path, sprite, vtt} = prop;

  await ensureDir(sprite);

  const duration = durationMs / 1000;

  await execFfmepgCommand(ffmpeg, [
    "-i",
    path,
    "-vf",
    "fps=1/5,scale=320:-1:flags=lanczos,tile=9x9",
    "-q:v",
    "2",
    "-frames:v",
    "1",
    "-y",
    sprite
  ]);

  const fps = 1 / 5;
  const interval = 1 / fps;
  const thumbWidth = 320;
  const thumbHeight = 180;

  let vttContent = "WEBVTT\n\n";

  for (let i = 0; i < 81; i++) {
    const startTime = i * interval;
    const endTime = Math.min(startTime + interval, duration);

    if (startTime >= duration) break;

    const row = Math.floor(i / 9);
    const col = i % 9;
    const x = col * thumbWidth;
    const y = row * thumbHeight;

    const startTimeStr = formatVttTime(startTime);
    const endTimeStr = formatVttTime(endTime);

    vttContent += `${startTimeStr} --> ${endTimeStr}\n`;
    vttContent += `#xywh=${x},${y},${thumbWidth},${thumbHeight}\n\n`;
  }

  await writeFile(vtt, new TextEncoder().encode(vttContent));

}

function formatVttTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const secsInt = Math.floor(secs);
  const ms = Math.floor((secs - secsInt) * 1000);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secsInt).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

interface GeneratePreviewProp {
  // ffmpeg 路径
  ffmpeg: string;
  // 原视频地址
  path: string;
  // 生成的预览视频地址
  preview: string;
  // 视频总时长
  durationMs: number;

  // 预览配置
  previewSetting: SystemPreviewSetting;
}

/**
 * 生成视频预览图，根据配置将视频分割成多个片段后合并
 */
export async function generatePreview(prop: GeneratePreviewProp) {
  const {ffmpeg, path, preview, durationMs, previewSetting} = prop;
  const duration = durationMs / 1000;

  await ensureDir(preview);

  let segments = Math.max(1, previewSetting.segments);
  const segmentDuration = Math.max(0.1, previewSetting.segmentDuration);
  let excludeStart = previewSetting.excludeStart || 0;
  let excludeEnd = previewSetting.excludeEnd || 0;

  if (excludeStart + excludeEnd >= duration) {
    excludeStart = 0;
    excludeEnd = 0;
  }

  const effectiveDuration = duration - excludeStart - excludeEnd;

  if (effectiveDuration < segmentDuration) {
    throw new Error(`视频有效时长不足 ${segmentDuration} 秒`);
  }

  const maxPossibleSegments = Math.floor(effectiveDuration / segmentDuration);
  if (segments > maxPossibleSegments) {
    segments = maxPossibleSegments;
  }

  const startTimes: number[] = [];

  if (segments === 1) {
    const startTime = excludeStart + (effectiveDuration - segmentDuration) / 2;
    startTimes.push(Math.round(startTime * 100) / 100);
  } else {
    const interval = (effectiveDuration - segmentDuration) / (segments - 1);
    for (let i = 0; i < segments; i++) {
      const startTime = excludeStart + i * interval;
      startTimes.push(Math.round(startTime * 100) / 100);
    }
  }

  const tmpDir = await tempDir();
  const tempFiles: string[] = [];
  const now = Date.now();

  for (let i = 0; i < segments; i++) {
    const tempFile = await join(tmpDir, `${now}_segment_${i}.mp4`);
    tempFiles.push(tempFile);

    await execFfmepgCommand(ffmpeg, [
      "-ss",
      startTimes[i]?.toString() || "0",
      "-i",
      path,
      "-t",
      segmentDuration.toString(),
      "-c",
      "copy",
      "-y",
      tempFile
    ]);
  }

  const filterComplexParts: string[] = [];
  for (let i = 0; i < segments; i++) {
    filterComplexParts.push(`[${i}:v][${i}:a]`);
  }

  const filterComplex = filterComplexParts.join("") + `concat=n=${segments}:v=1:a=1[outv][outa]`;

  const inputArgs: string[] = [];
  for (const tempFile of tempFiles) {
    inputArgs.push("-i", tempFile);
  }

  await execFfmepgCommand(ffmpeg, [
    ...inputArgs,
    "-filter_complex",
    filterComplex,
    "-map",
    "[outv]",
    "-map",
    "[outa]",
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-y",
    preview
  ], 120000);

  for (const tempFile of tempFiles) {
    try {
      await remove(tempFile);
    } catch {
      // ignore
    }
  }
}

/**
 * 生成封面
 * @param ffmpeg ffmpeg 路径
 * @param path 视频路径
 * @param cover 封面路径
 */
export async function generateCover(ffmpeg: string, path: string, cover: string) {
  await execFfmepgCommand(ffmpeg, [
    "-i",
    path,
    "-vframes",
    "1",
    "-ss",
    "1",
    "-f",
    "image2",
    "-y",
    cover
  ]);
}

/**
 * 获取视频时长
 */
export async function getVideoDuration(ffprobe: string, path: string) {
  const result = await execFfmepgCommand(ffprobe, [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    path
  ]);
  const duration = parseFloat(result.trim());
  if (isNaN(duration)) {
    return "0";
  }
  return (duration * 1000).toString();
}

/**
 * 获取视频完整信息
 */
export async function getVideoInfo(ffprobe: string, path: string): Promise<VideoInfo> {
  const result = await execFfmepgCommand(ffprobe, [
    "-v",
    "error",
    "-show_entries",
    "stream=width,height,r_frame_rate,bit_rate,codec_name,codec_type:format=duration,format_name",
    "-of",
    "json",
    path
  ]);

  const data = JSON.parse(result);
  const streams = data.streams || [];
  const format = data.format || {};

  const videoStream = streams.find((s: any) => s.codec_type === "video");
  const audioStream = streams.find((s: any) => s.codec_type === "audio");

  let fps = 0;
  if (videoStream?.r_frame_rate) {
    const [num, den] = videoStream.r_frame_rate.split("/");
    fps = den ? parseFloat(num) / parseFloat(den) : parseFloat(num);
  }

  let durationMs = 0;
  if (format.duration) {
    durationMs = parseFloat(format.duration) * 1000;
  }

  return {
    duration_ms: durationMs,
    width: videoStream?.width || 0,
    height: videoStream?.height || 0,
    fps: fps,
    bit_rate: videoStream?.bit_rate ? parseInt(videoStream.bit_rate) : 0,
    video_codec: videoStream?.codec_name || "",
    audio_codec: audioStream?.codec_name || "",
    container_format: format.format_name?.split(",")[0] || ""
  };
}