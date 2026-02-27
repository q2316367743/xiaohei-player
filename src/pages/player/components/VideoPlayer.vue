<template>
  <div class="video-content">
    <div ref="playerRef" class="artplayer"></div>
    
    <div class="keyframes-timeline" v-if="vttCues.length > 0">
      <div class="timeline-scroll" ref="timelineScrollRef">
        <div class="timeline-container" :style="{ width: timelineWidth + 'px' }">
          <div 
            v-for="(cue, index) in vttCues" 
            :key="index"
            class="keyframe-item"
            :style="getKeyframeStyle(cue)"
            @click="seekToTime(cue.startTime)"
          >
            <div class="keyframe-time">{{ formatTime(cue.startTime) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, computed, onBeforeUnmount} from 'vue';
import Artplayer from 'artplayer';
import type {Video} from '@/entity/domain/Video.ts';
import {convertFileSrc} from '@tauri-apps/api/core';
import {readTextFile} from '@tauri-apps/plugin-fs';
import {parseVtt, type VttCue} from "@/util";

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
const player = ref<Artplayer>();
const vttCues = ref<VttCue[]>([]);
const timelineWidth = computed(() => vttCues.value.length * 120);

async function loadVtt() {
  if (!props.video?.vtt_path) {
    return;
  }
  
  try {
    const content = await readTextFile(props.video.vtt_path);
    const cues = parseVtt(content);
    vttCues.value = cues;
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
  });
  
  player.value.on('error', (error) => {
    console.error('Player error:', error);
  });
  
  player.value.on('timeupdate', () => {
    const videoElement = player.value?.video;
    if (videoElement) {
      emit('timeupdate', videoElement.currentTime);
      vttCues.value.find(cue => 
        videoElement.currentTime >= cue.startTime && videoElement.currentTime <= cue.endTime
      );
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
    backgroundSize: '2880px 1620px'
  };
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function init() {
  loadVtt().then(() => {
    initPlayer();
  });
}

defineExpose({
  init
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
