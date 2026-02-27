<template>
  <div class="player-page">
    <header class="player-header">
      <t-space size="small" class="player-header__left">
        <t-button theme="primary" variant="text" shape="square" @click="goBack">
          <template #icon>
            <chevron-left-icon />
          </template>
        </t-button>
        <div class="player-header__title">
          <span>{{ video?.title }}</span>
        </div>
      </t-space>
    </header>
    
    <div class="player-container">
      <!-- 左侧视频信息 -->
      <div class="video-info-panel">
        <div class="video-meta">
          <div class="meta-item">
            <span class="label">时长：</span>
            <span class="value">{{ formatDuration(video?.duration_ms || 0) }}</span>
          </div>
          <div class="meta-item">
            <span class="label">大小：</span>
            <span class="value">{{ formatSize(video?.file_size || 0) }}</span>
          </div>
          <div class="meta-item">
            <span class="label">分辨率：</span>
            <span class="value">{{ video?.width }}x{{ video?.height }}</span>
          </div>
          <div class="meta-item">
            <span class="label">格式：</span>
            <span class="value">{{ video?.container_format }}</span>
          </div>
          <div class="meta-item">
            <span class="label">视频编码：</span>
            <span class="value">{{ video?.video_codec }}</span>
          </div>
          <div class="meta-item">
            <span class="label">音频编码：</span>
            <span class="value">{{ video?.audio_codec }}</span>
          </div>
        </div>
      </div>
      
      <!-- 右侧视频内容 -->
      <div class="video-content">
        <!-- 视频播放器 -->
        <div ref="playerRef" class="artplayer"></div>
        
        <!-- 关键帧时间轴 -->
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
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, computed, onMounted, onBeforeUnmount} from 'vue';
import {ChevronLeftIcon} from 'tdesign-icons-vue-next';
import Artplayer from 'artplayer';
import type {Video} from '@/entity/domain/Video.ts';
import {getVideoById} from '@/service/VideoService.ts';
import {convertFileSrc} from '@tauri-apps/api/core';
import {readTextFile} from '@tauri-apps/plugin-fs';
import {parseVtt, type VttCue} from "@/util";

defineOptions({
  name: 'PlayerPage'
});

const route = useRoute();
const router = useRouter();
const videoId = route.params.id as string;

const playerRef = ref<HTMLDivElement>();
const timelineScrollRef = ref<HTMLDivElement>();
const video = ref<Video>();
const player = ref<Artplayer>();

const vttCues = ref<VttCue[]>([]);
const timelineWidth = computed(() => vttCues.value.length * 120);

function goBack() {
  router.back();
}

onMounted(async () => {
  try {
    const videoData = await getVideoById(videoId);
    
    if (!videoData) {
      router.replace('/');
      return;
    }
    
    video.value = videoData;
    await loadVtt();
    initPlayer();
  } catch (error) {
    console.error('Failed to load video:', error);
    router.replace('/');
  }
});

async function loadVtt() {
  if (!video.value?.vtt_path) {
    return;
  }
  
  try {
    const content = await readTextFile(video.value.vtt_path);
    const cues = parseVtt(content);
    vttCues.value = cues;
  } catch (error) {
    console.error('Failed to load VTT file:', error);
  }
}

function initPlayer() {
  if (!playerRef.value || !video.value) return;
  
  const videoUrl = convertFileSrc(video.value.file_path);
  
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
    const videoElement = player.value?.video;
    if (videoElement) {
      console.log('Video element:', videoElement);
      console.log('Video src:', videoElement.src);
      console.log('Video readyState:', videoElement.readyState);
      console.log('Video videoWidth:', videoElement.videoWidth);
      console.log('Video videoHeight:', videoElement.videoHeight);
    }
  });
  
  player.value.on('error', (error) => {
    console.error('Player error:', error);
  });
  
  player.value.on('timeupdate', () => {
    const videoElement = player.value?.video;
    if (videoElement) {
      syncKeyframeProgress(videoElement.currentTime);
    }
  });
}

function seekToTime(time: number) {
  if (player.value) {
    player.value.seek = time;
  }
}

function syncKeyframeProgress(currentTime: number) {
  vttCues.value.find(cue => 
    currentTime >= cue.startTime && currentTime <= cue.endTime
  );
}

function getKeyframeStyle(cue: VttCue) {
  if (!video.value?.sprite_path) {
    return {};
  }
  
  return {
    backgroundImage: `url(${convertFileSrc(video.value.sprite_path)})`,
    backgroundPosition: `-${cue.x}px -${cue.y}px`,
    backgroundSize: '2880px 1620px'
  };
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

onBeforeUnmount(() => {
  if (player.value) {
    player.value.destroy();
  }
});
</script>

<style scoped lang="less">
.player-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--td-bg-color-page);
  color: var(--td-text-color-primary);
  
  .player-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 12px 11px 8px;
    height: 56px;
    line-height: 32px;
    border-bottom: 1px solid var(--td-border-level-2-color);
    box-sizing: border-box;
    background: var(--td-bg-color-container);
    
    &__left {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0;
    }
    
    &__title {
      display: flex;
      align-items: center;
      font-size: var(--td-font-size-title-medium);
      font-weight: 600;
      color: var(--td-text-color-primary);
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  
  .player-container {
    flex: 1;
    display: flex;
    overflow: hidden;
    
    .video-info-panel {
      width: 30%;
      padding: var(--td-comp-paddingLR-l);
      background: var(--td-bg-color-secondarycontainer);
      overflow-y: auto;
      
      .video-meta {
        .meta-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--td-comp-margin-m);
          font-size: var(--td-font-size-body-medium);
          
          .label {
            color: var(--td-text-color-secondary);
          }
          
          .value {
            color: var(--td-text-color-primary);
          }
        }
      }
    }
    
    .video-content {
      width: 70%;
      display: flex;
      flex-direction: column;
      
      .artplayer {
        flex: 1;
        width: 100%;
      }
      
      .keyframes-timeline {
        height: 120px;
        background: var(--td-bg-color-secondarycontainer);
        border-top: 1px solid var(--td-border-level-1-color);
        padding: var(--td-comp-paddingTB-m);
        
        .timeline-scroll {
          width: 100%;
          height: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          white-space: nowrap;
          
          &::-webkit-scrollbar {
            height: 8px;
          }
          
          &::-webkit-scrollbar-track {
            background: var(--td-scroll-track-color);
            border-radius: var(--td-radius-default);
          }
          
          &::-webkit-scrollbar-thumb {
            background: var(--td-scrollbar-color);
            border-radius: var(--td-radius-default);
            
            &:hover {
              background: var(--td-scrollbar-hover-color);
            }
          }
          
          .timeline-container {
            display: flex;
            height: 100%;
            min-width: max-content;
            
            .keyframe-item {
              width: 100px;
              height: 80px;
              margin-right: var(--td-comp-margin-xl);
              background-size: cover;
              background-position: center;
              cursor: pointer;
              border-radius: var(--td-radius-medium);
              position: relative;
              transition: transform 0.2s;
              
              &:hover {
                transform: scale(1.05);
              }
              
              .keyframe-time {
                position: absolute;
                bottom: var(--td-comp-margin-xs);
                left: var(--td-comp-margin-xs);
                background: var(--td-mask-active);
                color: var(--td-text-color-anti);
                font-size: var(--td-font-size-link-small);
                padding: var(--td-comp-paddingTB-xxs) var(--td-comp-paddingLR-xs);
                border-radius: var(--td-radius-small);
              }
            }
          }
        }
      }
    }
  }
}
</style>
