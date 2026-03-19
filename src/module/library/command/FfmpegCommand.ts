// import {invoke} from "@tauri-apps/api/core";
import {mkdir, writeFile, remove} from '@tauri-apps/plugin-fs';
import {dirname, join, tempDir} from "@tauri-apps/api/path";
import type {VideoInfo} from "@/entity/domain/Video.ts";
import type {SystemPreviewSetting} from "@/entity/setting/SystemSetting.ts";
import {Command} from "@tauri-apps/plugin-shell";
// import {invoke} from "@tauri-apps/api/core";

function execFfmepgCommand(args: Array<string>, timeoutMs: number = 30000) {

  const command = Command.sidecar("binaries/ffmpeg", args);
  const commandPromise = command.execute().then(r => {
    if (r.code !== 0) return Promise.reject(r.stderr);
    return r.stdout || r.stderr;
  });

  if (!timeoutMs) {
    return commandPromise
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(`FFmpeg command timed out after ${timeoutMs}ms`);
    }, timeoutMs);
  });

  return Promise.race([commandPromise, timeoutPromise]);
}

function escapePath(path: string): string {
  // if (path.includes(' ') || path.includes('"') || path.includes("'")) {
  //   return `"${path.replace(/"/g, '\\"')}"`;
  // }
  return path;
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
  durationMs: number;
  path: string;
  sprite: string;
  vtt: string;
  videoInfo: VideoInfo;
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
  // 原视频地址
  path: string;
  // 生成的预览视频地址
  preview: string;
  // 视频总时长
  durationMs: number;

  // 预览配置
  previewSetting: SystemPreviewSetting;
}

export async function generateVtt(prop: GenerateVttProp) {
  const {durationMs, path, sprite, vtt, videoInfo} = prop;

  await ensureDir(sprite);

  const duration = durationMs / 1000;

  const thumbHeight = 64;
  const thumbWidth = Math.round(videoInfo.width * (thumbHeight / videoInfo.height));

  await execFfmepgCommand([
    "-hide_banner",
    "-i",
    escapePath(path),
    "-vf",
    `fps=1/5,scale=${thumbWidth}:-1:flags=lanczos,tile=9x9`,
    "-q:v",
    "2",
    "-frames:v",
    "1",
    "-y",
    escapePath(sprite)
  ]);

  const fps = 1 / 5;
  const interval = 1 / fps;

  const spriteFileName = sprite.split(/[/\\]/).pop() || 'sprite.jpg';

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
    vttContent += `${spriteFileName}#xywh=${x},${y},${thumbWidth},${thumbHeight}\n\n`;
  }

  await writeFile(vtt, new TextEncoder().encode(vttContent));

}

/**
 * 生成视频预览图，根据配置将视频分割成多个片段后合并
 */
export async function generatePreview(prop: GeneratePreviewProp) {
  const {path, preview, durationMs, previewSetting} = prop;
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
    return Promise.reject(`视频有效时长不足 ${segmentDuration} 秒`);
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

    await execFfmepgCommand([
      "-hide_banner",
      "-ss",
      startTimes[i]?.toString() || "0",
      "-i",
      escapePath(path),
      "-t",
      segmentDuration.toString(),
      "-c",
      "copy",
      "-y",
      escapePath(tempFile)
    ]);
  }

  const filterComplexParts: string[] = [];
  for (let i = 0; i < segments; i++) {
    filterComplexParts.push(`[${i}:v][${i}:a]`);
  }

  const filterComplex = filterComplexParts.join("") + `concat=n=${segments}:v=1:a=1[outv][outa]`;

  const inputArgs: string[] = [];
  for (const tempFile of tempFiles) {
    inputArgs.push("-i", escapePath(tempFile));
  }

  await execFfmepgCommand([
    "-hide_banner",
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
    escapePath(preview)
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
 * @param path 视频路径
 * @param cover 封面路径
 */
export async function generateCover(path: string, cover: string) {
  await execFfmepgCommand([
    "-hide_banner",
    "-ss",
    "1",
    "-i",
    escapePath(path),
    "-vframes",
    "1",
    "-f",
    "image2",
    "-y",
    escapePath(cover)
  ]);
}

/**
 * 获取视频时长
 */
export async function getVideoDuration(path: string) {
  const result = await execFfmepgCommand([
    "-hide_banner",
    "-i",
    escapePath(path),
    "-f",
    "null",
    "-"
  ]);

  const durationMatch = result.match(/Duration:\s+(\d{2}):(\d{2}):(\d{2}\.\d{2})/);

  if (durationMatch && durationMatch[1] && durationMatch[2] && durationMatch[3]) {
    const hours = parseInt(durationMatch[1]);
    const minutes = parseInt(durationMatch[2]);
    const seconds = parseFloat(durationMatch[3]);
    const duration = hours * 3600 + minutes * 60 + seconds;
    return (duration * 1000).toString();
  }

  return "0";
}

/**
 * 获取视频完整信息
 */
export async function getVideoInfo(path: string): Promise<VideoInfo> {
  const result = await execFfmepgCommand([
    "-hide_banner",
    "-i",
    escapePath(path),
    "-f",
    "null",
    "-"
  ]);

  const lines = result.split('\n');

  let durationMs = 0;
  let width = 0;
  let height = 0;
  let fps = 0;
  let bitRate = 0;
  let videoCodec = "";
  let audioCodec = "";
  let containerFormat = "";

  for (const line of lines) {
    const durationMatch = line.match(/Duration:\s+(\d{2}):(\d{2}):(\d{2}\.\d{2})/);
    if (durationMatch && durationMatch[1] && durationMatch[2] && durationMatch[3]) {
      const hours = parseInt(durationMatch[1]);
      const minutes = parseInt(durationMatch[2]);
      const seconds = parseFloat(durationMatch[3]);
      durationMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
    }

    const videoStreamMatch = line.match(/Stream\s+#\d+:\d+.*Video:\s+(\w+)/);
    if (videoStreamMatch && videoStreamMatch[1]) {
      videoCodec = videoStreamMatch[1];
    }

    const audioStreamMatch = line.match(/Stream\s+#\d+:\d+.*Audio:\s+(\w+)/);
    if (audioStreamMatch && audioStreamMatch[1]) {
      audioCodec = audioStreamMatch[1];
    }

    const resolutionMatch = line.match(/(\d{3,5})x(\d{3,5})/);
    if (resolutionMatch && resolutionMatch[1] && resolutionMatch[2]) {
      width = parseInt(resolutionMatch[1]);
      height = parseInt(resolutionMatch[2]);
    }

    const fpsMatch = line.match(/(\d+(?:\.\d+)?)\s*fps/);
    if (fpsMatch && fpsMatch[1]) {
      fps = parseFloat(fpsMatch[1]);
    }

    const bitRateMatch = line.match(/(\d+)\s*kb\/s/);
    if (bitRateMatch && bitRateMatch[1]) {
      bitRate = parseInt(bitRateMatch[1]) * 1000;
    }

    const formatMatch = line.match(/Input\s+#\d+,\s*(\w+)/);
    if (formatMatch && formatMatch[1]) {
      containerFormat = formatMatch[1];
    }
  }

  return {
    duration_ms: durationMs,
    width: width,
    height: height,
    fps: fps,
    bit_rate: bitRate,
    video_codec: videoCodec,
    audio_codec: audioCodec,
    container_format: containerFormat
  };
}

/**
 * 生成视频标记
 * @param video 视频路径
 * @param marker 生成的标记路径
 * @param time 标记时间（秒）
 */
export async function generateMarker(
  video: string,
  marker: string,
  time: number
) {
  await ensureDir(marker);
  await execFfmepgCommand([
    "-hide_banner",
    "-ss",
    String(time),
    "-i",
    escapePath(video),
    "-vframes",
    "1",
    "-f",
    "image2",
    "-y",
    escapePath(marker)
  ]);
}