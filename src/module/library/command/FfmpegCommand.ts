import {invoke} from "@tauri-apps/api/core";
import {mkdir} from '@tauri-apps/plugin-fs';
import {dirname} from "@tauri-apps/api/path";

function execFfmepgCommand(ffmpeg: string, args: Array<string>) {
  return invoke<string>("ffmpeg_command", {
    cmd: ffmpeg,
    args
  });
}

async function ensureDir(filePath: string) {
  const dir = await dirname(filePath);
  try {
    await mkdir(dir, { recursive: true });
  } catch {
    // 目录可能已存在，忽略错误
  }
}

/**
 * 生成vtt图片，一共两个文件，一个 jpg 图片，是 9x9 的图片，另一个是 vtt 文件，记录着每一个图片的时间轴信息。
 * @param ffmpeg ffmpeg 路径
 * @param path 视频路径
 * @param prefix 封面图路径
 */
export async function generateVtt(ffmpeg: string, path: string, prefix: string) {
  const sprite = prefix + "_sprite.jpg";
  const thumbs = prefix + "_thumbs.vtt";
  
  await ensureDir(sprite);
  
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
  
  return {sprite, thumbs};
}

/**
 * 生成视频预览图，这是一个 10s 的视频，将视频平均分成 5 份，每份 2s，之后合并成一个 10s 的视频
 * @param ffmpeg ffmpeg 路径
 * @param path 视频路径
 * @param preview 预览图路径
 * @param durationMs 视频时长（毫秒），如果为 0 则自动获取
 */
export async function generatePreview(ffmpeg: string, path: string, preview: string, durationMs?: number) {
  let duration = 0;
  if (durationMs && durationMs > 0) {
    duration = durationMs / 1000;
  } else {
    const durationStr = await getVideoDuration(ffmpeg, path);
    duration = parseFloat(durationStr) / 1000;
  }
  
  await ensureDir(preview);
  
  const segmentDuration = duration / 5;
  
  const filterComplex = [];
  for (let i = 0; i < 5; i++) {
    const startTime = (i * segmentDuration).toFixed(2);
    filterComplex.push(`[0:v]trim=start=${startTime}:duration=2,setpts=PTS-STARTPTS[v${i}];[0:a]atrim=start=${startTime}:duration=2,asetpts=PTS-STARTPTS[a${i}]`);
  }
  
  const concatInputs = [];
  for (let i = 0; i < 5; i++) {
    concatInputs.push(`[v${i}][a${i}]`);
  }
  
  filterComplex.push(`${concatInputs.join('')}concat=n=5:v=1:a=1[outv][outa]`);
  
  await execFfmepgCommand(ffmpeg, [
    "-i",
    path,
    "-filter_complex",
    filterComplex.join(';'),
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
  ])
}

/**
 * 获取视频时长
 */
export async function getVideoDuration(ffmpeg: string, path: string) {
  const result = await execFfmepgCommand(ffmpeg, [
    "-i",
    path,
    "-f",
    "null",
    "-"
  ]);
  const durationMatch = result.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
  if (durationMatch && durationMatch[1] && durationMatch[2] && durationMatch[3]) {
    const hours = parseInt(durationMatch[1]);
    const minutes = parseInt(durationMatch[2]);
    const seconds = parseFloat(durationMatch[3]);
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    return (totalSeconds * 1000).toString();
  }
  return "0";
}