<template>
  <div class="video-content">
    <div ref="playerRef" class="artplayer"></div>

    <KeyframesTimeline
      v-if="vttCues.length > 0"
      :vttCues="vttCues"
      :currentTime="currentTime"
      :duration="duration"
      :spriteUrl="spriteUrl"
      @seek="seekToTime"
    />
  </div>
</template>

<script lang="ts" setup>
import Artplayer from 'artplayer';
import type {Video} from '@/entity/domain/Video.ts';
import {readTextFile} from '@tauri-apps/plugin-fs';
import {parseVtt, type VttCue} from "@/util/file/VttParser.ts";
import {getCurrentWindow} from "@tauri-apps/api/window";
import {convertFileSrcToUrl} from "@/lib/FileSrc.ts";
import {getVideoType, playFlv, playM3u8, playTs} from "@/lib/artplayer.ts";
import {debounce} from "es-toolkit";
import {listMarker, updateVideoStatus} from "@/service";
import KeyframesTimeline from "./KeyframesTimeline.vue";

defineOptions({
  name: 'VideoPlayer'
});

const props = defineProps<{
  video?: Video;
}>();

const currentWindow = getCurrentWindow();
const playerRef = ref<HTMLDivElement>();
const player = ref<Artplayer>();
const vttCues = ref<VttCue[]>([]);
const currentTime = ref(0);
const duration = ref(0);
const spriteUrl = ref('');

async function loadVtt() {
  if (!props.video?.vtt_path) {
    return;
  }

  try {
    const content = await readTextFile(props.video.vtt_path);
    vttCues.value = parseVtt(content);
  } catch (error) {
    console.error('Failed to load VTT file:', error);
  }
}

const THUMBNAIL_HEIGHT = 90;

function getThumbnailStyle(cue: VttCue) {
  if (!spriteUrl.value) {
    return {};
  }
  const scale = THUMBNAIL_HEIGHT / cue.height;
  const displayWidth = cue.width * scale;
  const spriteWidth = 2880;
  const spriteHeight = 1620;
  
  return {
    backgroundImage: `url(${spriteUrl.value})`,
    backgroundPosition: `-${cue.x * scale}px -${cue.y * scale}px`,
    backgroundSize: `${spriteWidth * scale}px ${spriteHeight * scale}px`,
    width: `${displayWidth}px`,
    height: `${THUMBNAIL_HEIGHT}px`
  };
}

function findCueByTime(time: number): VttCue | null {
  return vttCues.value.find(cue =>
    time >= cue.startTime && time <= cue.endTime
  ) || null;
}


const updateResumeTime = debounce(async rt => {
  if (!props.video) return;
  await updateVideoStatus(props.video.id, {resume_time: rt})
}, 300);

function initPlayer() {
  if (!playerRef.value || !props.video) return;

  const videoUrl = convertFileSrcToUrl(props.video.file_path);
  const posterUrl = props.video.cover_path ? convertFileSrcToUrl(props.video.cover_path) : undefined;

  player.value = new Artplayer({
    container: playerRef.value,
    url: videoUrl,
    poster: posterUrl,
    type: getVideoType(videoUrl),
    fullscreen: false,
    fullscreenWeb: false,
    volume: 0.7,
    isLive: false,
    muted: false,
    autoplay: false,
    pip: true,
    autoSize: false,
    autoMini: true,
    screenshot: true,
    setting: true,
    loop: false,
    flip: true,
    playbackRate: true,
    aspectRatio: true,
    miniProgressBar: true,
    theme: '#23ade5',
    lang: 'zh-cn',
    moreVideoAttr: {
      crossOrigin: 'anonymous',
      playsInline: true,
      controls: false,
      autoplay: false,
    },
    customType: {
      flv: playFlv,
      m3u8: playM3u8,
      ts: playTs,
    },
    controls: [
      ...(vttCues.value.length > 0 && spriteUrl.value ? [{
        name: 'thumbnail',
        position: 'top' as const,
        index: 20,
        html: '<div class="art-control-thumbnails"></div>',
        style: {
          display: 'none',
          position: 'absolute',
          bottom: '100%',
          marginBottom: '10px',
          pointerEvents: 'none',
          zIndex: '100',
        },
        mounted($control: HTMLElement) {
          const art = this as unknown as Artplayer;
          
          art.on('setBar', (type: string, percentage: number) => {
            if (type === 'hover') {
              const second = percentage * art.duration;
              const cue = findCueByTime(second);
              
              if (cue) {
                const style = getThumbnailStyle(cue);
                $control.style.display = 'flex';
                $control.style.backgroundImage = style.backgroundImage as string;
                $control.style.backgroundPosition = style.backgroundPosition as string;
                $control.style.backgroundSize = style.backgroundSize as string;
                $control.style.width = style.width as string;
                $control.style.height = style.height as string;
                
                const progressWidth = art.template.$progress.clientWidth;
                const width = progressWidth * percentage;
                const scale = THUMBNAIL_HEIGHT / cue.height;
                const thumbWidth = cue.width * scale;
                
                if (width <= thumbWidth / 2) {
                  $control.style.left = '0px';
                } else if (width > progressWidth - thumbWidth / 2) {
                  $control.style.left = `${progressWidth - thumbWidth}px`;
                } else {
                  $control.style.left = `${width - thumbWidth / 2}px`;
                }
              } else {
                $control.style.display = 'none';
              }
            }
          });
          
          art.template.$progress.addEventListener('mouseleave', () => {
            $control.style.display = 'none';
          });
        }
      }] : []),
      {
        name: 'fullscreen',
        position: 'right',
        html: `<span>全屏</span>`,
        click() {
          currentWindow.isFullscreen().then(v => {
            player.value!.fullscreenWeb = !v;
            currentWindow.setFullscreen(!v);
          })
        }
      }
    ]
  }, art => {
    console.log('Player is ready');
    if (props.video?.resume_time) {
      seekToTime(props.video.resume_time);
    }
    if (player.value?.video) {
      duration.value = player.value.video.duration || 0;
    }
    listMarker(props.video!.id).then(() => {
    })
    art.on('video:timeupdate', () => {
      currentTime.value = art.currentTime;
    });
    art.on('seek', res => {
      updateResumeTime(res);
    });
    art.on('fullscreenWeb', e => {
      if (!e) {
        currentWindow.setFullscreen(false);
      }
    });
    art.on('error', (error) => {
      console.error('Player error:', error);
    });
  });

}

function seekToTime(time: number) {
  if (player.value) {
    player.value.seek = time;
  }
}

function init() {
  if (props.video?.sprite_path) {
    spriteUrl.value = convertFileSrcToUrl(props.video.sprite_path);
  }
  loadVtt().then(() => {
    initPlayer();
  });
}

onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  if (player.value) {
    player.value.destroy();
  }
});
</script>

<style scoped lang="less">
@import "../less/VideoPlayer.less";
</style>
