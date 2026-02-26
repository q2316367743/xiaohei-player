<template>
  <div class="scene-page">
    <div class="video-grid">
      <div
        v-for="video in videos"
        :key="video.id"
        class="video-card"
        @mouseenter="handleMouseEnter(video)"
        @mouseleave="handleMouseLeave"
      >
        <div class="video-cover">
          <img
            :src="getCoverUrl(video.id)"
            :alt="video.title"
            class="cover-image"
          />
          <div class="video-preview" v-show="hoveredVideoId === video.id">
            <video
              :src="getPreviewUrl(video.id)"
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
    </div>
    
    <t-loading v-if="loading" size="large" />
    <t-empty v-if="!loading && videos.length === 0" description="暂无视频" />
  </div>
</template>

<script lang="ts" setup>
import {ref, onMounted} from 'vue';
import {getAllVideos} from '@/service/VideoService.ts';
import type {Video} from '@/entity/domain/Video.ts';
import {appDataDir} from '@tauri-apps/api/path';

const videos = ref<Video[]>([]);
const loading = ref(true);
const hoveredVideoId = ref<string | null>(null);
const appDataPath = ref('');

onMounted(async () => {
  appDataPath.value = await appDataDir();
  await loadVideos();
});

async function loadVideos() {
  loading.value = true;
  try {
    videos.value = await getAllVideos();
  } catch (e) {
    console.error('加载视频列表失败', e);
  } finally {
    loading.value = false;
  }
}

function getCoverUrl(videoId: string): string {
  return `file://${appDataPath.value}generated/vtt/${videoId}_sprite.jpg`;
}

function getPreviewUrl(videoId: string): string {
  return `file://${appDataPath.value}generated/screenshots/${videoId}.mp4`;
}

function handleMouseEnter(video: Video) {
  hoveredVideoId.value = video.id;
}

function handleMouseLeave() {
  hoveredVideoId.value = null;
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
</script>

<style scoped lang="less">
.scene-page {
  padding: 16px;
  min-height: calc(100vh - 64px);
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

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
  object-fit: cover;
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
