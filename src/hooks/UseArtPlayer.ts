import Artplayer from "artplayer";
import {playFlv, playM3u8} from "@/lib/artplayer.ts";

export function useArtPlayer(container: HTMLDivElement) {
  const videoEnded = createEventHook();
  const instance = new Artplayer({
    container: container,
    url: '',
    type: 'mp4',
    customType: {
      flv: playFlv,
      m3u8: playM3u8
    },
    flip: true,
    playbackRate: true,
    aspectRatio: true,
    screenshot: true,
    fullscreen: true,
    fullscreenWeb: true,
    setting: true,
  });
  instance.on('video:ended', async () => {
    await videoEnded.trigger()
  })

  const switchUrl = async (url: string, type?: string) => {
    await instance.switchUrl(url);
    await instance.play();
    if (type) {
      instance.type = type;
    } else {
      let path: string | undefined = undefined;
      try {
        path = new URL(url).pathname.toLowerCase();
      } catch {
        path = undefined;
      }
      if (path) {
        if (path.endsWith('.m3u8')) instance.type = 'm3u8';
        else if (path.endsWith('.flv')) instance.type = 'flv';
        else instance.type = 'mp4';
      } else {
        instance.type = 'mp4';
      }
    }
  }


  return {
    // artplayer实例
    instance,
    // 播放结束事件
    videoEnded,
    // 切换链接
    switchUrl
  }
}