<template>
  <div
    class="video-card"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <div class="video-cover">
      <div
        v-if="coverUrl"
        class="cover-image"
        :style="coverStyle"
        @mousemove="handleMouseMove"
      />
      <div class="video-preview" v-show="isHovered && previewUrl">
        <video
          :src="previewUrl"
          class="preview-video"
          autoplay
          loop
          muted
          playsinline
        />
      </div>
    </div>
    <div class="video-info">
      <div class="video-title" :title="video.title">{{ video.title }}</div>
      <div class="video-meta">
        <span class="duration">{{ formatDuration(video.duration_ms) }}</span>
        <span class="size">{{ formatSize(video.file_size) }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {Video} from '@/entity/domain/Video.ts';
import {convertFileSrc} from '@tauri-apps/api/core';
import {readTextFile} from '@tauri-apps/plugin-fs';
import {parseVtt, type VttCue} from "@/util";

const router = useRouter();

interface Props {
  video: Video;
}

const props = defineProps<Props>();

function handleClick() {
  router.push(`/player/${props.video.id}`);
}

const vttCues = ref<VttCue[]>([]);
const currentFrame = ref(0);
const isHovered = ref(false);

onMounted(() => {
  loadVtt();
});

const coverUrl = computed(() => {
  if (props.video.sprite_path) {
    return convertFileSrc(props.video.sprite_path);
  }
  return '';
});

const coverStyle = computed(() => {
  if (!coverUrl.value || vttCues.value.length === 0) {
    return {};
  }
  
  const cue = vttCues.value[currentFrame.value];
  if (!cue) {
    return {};
  }
  
  const frameAspectRatio = cue.width / cue.height;
  const containerAspectRatio = 16 / 9;
  
  let scale;
  if (frameAspectRatio > containerAspectRatio) {
    scale = 1;
  } else {
    scale = containerAspectRatio / frameAspectRatio;
  }
  
  const scaledX = cue.x * scale;
  const scaledY = cue.y * scale;
  const scaledWidth = cue.width * scale;
  const scaledHeight = cue.height * scale;
  
  const spriteWidth = 2880 * scale;
  const spriteHeight = 1620 * scale;
  
  const offsetX = (spriteWidth - scaledWidth) / 2;
  const offsetY = (spriteHeight - scaledHeight) / 2;
  
  return {
    backgroundImage: `url(${coverUrl.value})`,
    backgroundPosition: `-${scaledX + offsetX}px -${scaledY + offsetY}px`,
    backgroundSize: `${spriteWidth}px ${spriteHeight}px`,
    backgroundRepeat: 'no-repeat'
  };
});

const previewUrl = computed(() => {
  if (props.video.screenshot_path) {
    return convertFileSrc(props.video.screenshot_path);
  }
  return '';
});

async function loadVtt() {
  if (!props.video.vtt_path) {
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


function handleMouseMove(event: MouseEvent) {
  if (vttCues.value.length === 0) {
    return;
  }
  
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const progress = Math.max(0, Math.min(1, x / rect.width));
  
  const frameIndex = Math.floor(progress * vttCues.value.length);
  currentFrame.value = Math.min(frameIndex, vttCues.value.length - 1);
}

function handleMouseEnter() {
  isHovered.value = true;
}

function handleMouseLeave() {
  isHovered.value = false;
  currentFrame.value = 0;
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

watch(() => props.video.vtt_path, () => {
  loadVtt();
});
</script>

<style scoped lang="less">
.video-card {
  border-radius: 8px;
  overflow: hidden;
  background: var(--td-bg-color-container);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
}

.video-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--td-bg-color-page);
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.video-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-info {
  padding: 12px;
}

.video-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8px;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--td-text-color-secondary);
}

.duration,
.size {
  padding: 2px 6px;
  background: var(--td-bg-color-container-hover);
  border-radius: 4px;
}
</style>
