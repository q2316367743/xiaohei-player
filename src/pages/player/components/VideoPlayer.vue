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
import {onBeforeUnmount, onMounted, ref} from 'vue';
import Artplayer from 'artplayer';
import type {Video} from '@/entity/domain/Video.ts';
import {convertFileSrc} from '@tauri-apps/api/core';
import {readTextFile} from '@tauri-apps/plugin-fs';
import {parseVtt, type VttCue} from "@/util/file/VttParser.ts";

defineOptions({
  name: 'VideoPlayer'
});

const props = defineProps<{
  video?: Video;
}>();

const emit = defineEmits<{
  timeupdate: [currentTime: number];
}>();

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
  if (!timelineRef.value || vttCues.value.length === 0 || duration.value === 0) return;
  
  const containerWidth = timelineRef.value.clientWidth;
  const currentPercent = currentTime.value / duration.value;
  const totalWidth = timelineRef.value.scrollWidth;
  
  const targetOffset = currentPercent * totalWidth - containerWidth / 2;
  scrollOffset.value = Math.max(0, Math.min(totalWidth - containerWidth, targetOffset));
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
  console.log(props.video)
  if (!props.video?.vtt_path) {
    return;
  }

  try {
    const content = await readTextFile(props.video.vtt_path);
    vttCues.value = parseVtt(content);
    console.log(vttCues.value)
  } catch (error) {
    console.error('Failed to load VTT file:', error);
  }
}

function initPlayer() {
  if (!playerRef.value || !props.video) return;

  const videoUrl = convertFileSrc(props.video.file_path);

  player.value = new Artplayer({
    container: playerRef.value,
    url: videoUrl,
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
    fullscreen: true,
    fullscreenWeb: true,
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
      mp4: function (video: HTMLVideoElement, url: string) {
        video.src = url;
      },
      webm: function (video: HTMLVideoElement, url: string) {
        video.src = url;
      },
      mkv: function (video: HTMLVideoElement, url: string) {
        video.src = url;
      },
    },
  });

  player.value.on('ready', () => {
    console.log('Player is ready');
    if (player.value?.video) {
      duration.value = player.value.video.duration || 0;
    }
  });

  player.value.on('error', (error) => {
    console.error('Player error:', error);
  });

  player.value.on('timeupdate', () => {
    const videoElement = player.value?.video;
    if (videoElement) {
      currentTime.value = videoElement.currentTime;
      emit('timeupdate', videoElement.currentTime);
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
  if (!props.video?.sprite_path) {
    return {};
  }

  return {
    backgroundImage: `url(${convertFileSrc(props.video.sprite_path)})`,
    backgroundPosition: `-${cue.x}px -${cue.y}px`,
    backgroundSize: '2880px 1620px',
    width: `${(cue.width/cue.height*64).toFixed(2)}px`
  };
}

function init() {
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
@import "less/VideoPlayer";
</style>
