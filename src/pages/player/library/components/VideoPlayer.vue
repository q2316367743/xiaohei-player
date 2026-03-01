<template>
  <div class="video-content">
    <div ref="playerRef" class="artplayer"></div>

    <div class="keyframes-timeline" v-if="vttCues.length > 0">
      <div class="timeline-indicator-fixed">
        <div class="indicator-line"></div>
        <div class="indicator-head"></div>
      </div>
      <div
        class="timeline-container"
        ref="timelineRef"
        @mousedown="onTimelineMouseDown"
        @mousemove="onTimelineMouseMove"
        @mouseup="onTimelineMouseUp"
        @mouseleave="onTimelineMouseLeave"
        @wheel.prevent="onTimelineWheel"
      >
        <div
          class="timeline-track"
          :style="{ transform: `translateX(${-scrollOffset}px)` }"
        >
          <div
            v-for="(cue, index) in vttCues"
            :key="index"
            class="keyframe-item"
            :style="getKeyframeStyle(cue)"
            @click="seekToTime(cue.startTime)"
          />
        </div>
      </div>
      <div
        class="timeline-tooltip"
        v-if="isDragging || hoverCue"
        :style="{ left: '50%' }"
      >
        {{ hoverCue ? formatTime(hoverCue.startTime) : formatTime(currentTime) }}
      </div>
    </div>
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
import {updateVideoStatus} from "@/service";

defineOptions({
  name: 'VideoPlayer'
});

const props = defineProps<{
  video?: Video;
}>();

const currentWindow = getCurrentWindow();
const playerRef = ref<HTMLDivElement>();
const timelineRef = ref<HTMLDivElement>();
const player = ref<Artplayer>();
const vttCues = ref<VttCue[]>([]);
const currentTime = ref(0);
const duration = ref(0);
const scrollOffset = ref(0);
const hoverCue = ref<VttCue | null>(null);
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartOffset = ref(0);
const spriteUrl = ref('');

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
}

function updateScrollOffset() {
  if (!timelineRef.value || vttCues.value.length === 0 || duration.value === 0) return false;

  const containerWidth = timelineRef.value.clientWidth;
  const currentPercent = currentTime.value / duration.value;
  const totalWidth = timelineRef.value.scrollWidth;

  const targetOffset = currentPercent * totalWidth - containerWidth / 2;
  const newOffset = Math.max(0, Math.min(totalWidth - containerWidth, targetOffset));

  if (scrollOffset.value !== newOffset) {
    scrollOffset.value = newOffset;
    return true;
  }
  return false;
}

function getCueAtCenter(): VttCue | null {
  if (!timelineRef.value || vttCues.value.length === 0 || duration.value === 0) return null;

  const containerWidth = timelineRef.value.clientWidth;
  const centerPercent = (scrollOffset.value + containerWidth / 2) / timelineRef.value.scrollWidth;
  const centerTime = centerPercent * duration.value;

  return vttCues.value.find(cue =>
    centerTime >= cue.startTime && centerTime <= cue.endTime
  ) || null;
}

function onTimelineMouseDown(event: MouseEvent) {
  isDragging.value = true;
  dragStartX.value = event.clientX;
  dragStartOffset.value = scrollOffset.value;
  hoverCue.value = getCueAtCenter();
}

function onTimelineMouseMove(event: MouseEvent) {
  if (!timelineRef.value) return;

  if (isDragging.value) {
    const deltaX = event.clientX - dragStartX.value;
    const newOffset = dragStartOffset.value - deltaX;
    const maxOffset = timelineRef.value.scrollWidth - timelineRef.value.clientWidth;
    scrollOffset.value = Math.max(0, Math.min(maxOffset, newOffset));

    hoverCue.value = getCueAtCenter();
  } else {
    const rect = timelineRef.value.getBoundingClientRect();
    const scrollPos = scrollOffset.value + (event.clientX - rect.left);
    const totalWidth = timelineRef.value.scrollWidth;
    const percent = scrollPos / totalWidth;
    const hoverTimeSec = percent * duration.value;

    hoverCue.value = vttCues.value.find(cue =>
      hoverTimeSec >= cue.startTime && hoverTimeSec <= cue.endTime
    ) || null;
  }
}

function onTimelineMouseUp() {
  if (hoverCue.value) {
    seekToTime(hoverCue.value.startTime);
  }
  isDragging.value = false;
}

function onTimelineMouseLeave() {
  isDragging.value = false;
  hoverCue.value = null;
}

function onTimelineWheel(event: WheelEvent) {
  if (!timelineRef.value) return;
  const delta = event.deltaY > 0 ? 100 : -100;
  const maxOffset = timelineRef.value.scrollWidth - timelineRef.value.clientWidth;
  scrollOffset.value = Math.max(0, Math.min(maxOffset, scrollOffset.value + delta));
  hoverCue.value = getCueAtCenter();
}

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
  }, () => {
    console.log('Player is ready');
    if (props.video?.resume_time) {
      seekToTime(props.video.resume_time);
    }
    if (player.value?.video) {
      duration.value = player.value.video.duration || 0;
    }
  });


  player.value.on('fullscreenWeb', e => {
    if (!e) {
      currentWindow.setFullscreen(false);
    }
  })

  player.value.on('error', (error) => {
    console.error('Player error:', error);
  });

  const updateResumeTime = debounce(async rt => {
    if (!props.video) return;
    await updateVideoStatus(props.video.id, {resume_time: rt})
  }, 300);

  player.value.on('seek', res => {
    currentTime.value = res;
    updateResumeTime(res)
    if (!isDragging.value) {
      updateScrollOffset();
    }
  });
}

function seekToTime(time: number) {
  if (player.value) {
    player.value.seek = time;
  }
}

function getKeyframeStyle(cue: VttCue) {
  if (!props.video?.sprite_path || !spriteUrl.value) {
    return {};
  }

  const scale = 64 / cue.height;
  const displayWidth = cue.width * scale;
  const spriteWidth = 2880;
  const spriteHeight = 1620;

  return {
    backgroundImage: `url(${spriteUrl.value})`,
    backgroundPosition: `-${cue.x * scale}px -${cue.y * scale}px`,
    backgroundSize: `${spriteWidth * scale}px ${spriteHeight * scale}px`,
    width: `${displayWidth.toFixed(2)}px`,
    height: '64px'
  };
}

function init() {
  if (props.video?.sprite_path) {
    spriteUrl.value = convertFileSrcToUrl(props.video.sprite_path);
  }
  loadVtt().then(() => {
    initPlayer();
    nextTick(() => {
      updateScrollOffset();
    });
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
@import "less/VideoPlayer.less";
</style>
