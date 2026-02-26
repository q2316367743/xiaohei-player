import Hls from 'hls.js';
import flvjs from 'flv.js';
import Artplayer from "artplayer";

export function playFlv(video: HTMLVideoElement, url: string, art: Artplayer) {
  if (flvjs.isSupported()) {
    // @ts-ignore
    if (art.flv) art.flv.destroy();
    const flv = flvjs.createPlayer({ type: 'flv', url });
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
    // @ts-ignore
    if (art.hls) art.hls.destroy();
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