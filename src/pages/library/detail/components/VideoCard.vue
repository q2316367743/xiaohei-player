<template>
  <div
    class="video-card"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <div class="video-cover">
      <t-image :src="coverUrl" fit="cover" class="cover-image"/>
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
      <div class="progress-bar" v-if="progress > 0">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
    <div class="video-info">
      <div class="video-title" :title="video.title">{{ video.title }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {Video} from '@/entity/domain/Video.ts';
import {convertFileSrcToUrl} from "@/lib/FileSrc.ts";

const router = useRouter();

interface Props {
  video: Video;
}

const props = defineProps<Props>();

function handleClick() {
  router.push(`/player/library/${props.video.id}`);
}

const isHovered = ref(false);

const coverUrl = ref('');
const previewUrl = ref('');

const progress = computed(() => {
  if (!props.video.resume_time || !props.video.duration_ms) {
    return 0;
  }
  return Math.min((props.video.resume_time * 1000 / props.video.duration_ms) * 100, 100);
});

onMounted(() => {
  if (props.video.cover_path) {
    coverUrl.value = convertFileSrcToUrl(props.video.cover_path);
  }
  if (props.video.screenshot_path) {
    previewUrl.value = convertFileSrcToUrl(props.video.screenshot_path);
  }
});

function handleMouseEnter() {
  isHovered.value = true;
}

function handleMouseLeave() {
  isHovered.value = false;
}
</script>

<style scoped lang="less">
.video-card {
  overflow: hidden;
  background: transparent;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.video-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--td-bg-color-page);
  overflow: hidden;
  border-radius: 8px;
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
  z-index: 1;
  border-radius: 8px;
}

.preview-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: rgba(0, 0, 0, 0.6);
  z-index: 3;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--td-brand-color);
  transition: width 0.3s ease;
  border-bottom-left-radius: 8px;
  min-width: 3px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

.video-info {
  padding: 6px 0;
  background: transparent;
  text-align: center;
}

.video-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: transparent;
}
</style>
