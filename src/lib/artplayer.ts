import Hls from 'hls.js';
import flvjs from 'flv.js';
import mpegts from 'mpegts.js';
import Artplayer from "artplayer";

export const getVideoType = (url: string): string => {
  if (!url) return '';
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.endsWith('.flv')) return 'flv';
  if (lowerUrl.endsWith('.m3u8') || lowerUrl.includes('.m3u8')) return 'm3u8';
  if (lowerUrl.endsWith('.mp4')) return 'mp4';
  if (lowerUrl.endsWith('.webm')) return 'webm';
  if (lowerUrl.endsWith('.mkv')) return 'mkv';
  if (lowerUrl.endsWith('.ts')) return 'ts';
  return 'mp4';
};

export function playFlv(video: HTMLVideoElement, url: string, art: Artplayer) {
  if (flvjs.isSupported()) {
    if (art.flv) (art.flv as any).destroy();
    const flv = flvjs.createPlayer({type: 'flv', url});
    flv.attachMediaElement(video);
    flv.load();
    art.flv = flv;
    art.on('destroy', () => flv.destroy());
  } else {
    art.notice.show = 'Unsupported playback format: flv';
  }
}

export function playM3u8(video: HTMLVideoElement, url: string, art: Artplayer) {
  if (Hls.isSupported()) {
    if (art.hls) (art.hls as any).destroy();
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
    art.hls = hls;
    art.on('destroy', () => hls.destroy());
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
  } else {
    art.notice.show = 'Unsupported playback format: m3u8';
  }
}

export function playTs(video: HTMLVideoElement, url: string, art: Artplayer) {
  if (mpegts.isSupported()) {
    const flvPlayer = mpegts.createPlayer({
      type: 'mse',
      url: url,
      isLive: false,
    });
    flvPlayer.attachMediaElement(video);
    flvPlayer.load();
  } else {
    art.notice.show = 'Unsupported playback format: mpegts';
  }
}