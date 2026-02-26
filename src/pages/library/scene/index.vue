<template>
  <div class="scene-page">
    <div class="video-grid">
      <VideoCard
        v-for="video in videos"
        :key="video.id"
        :video="video"
        :is-hovered="hoveredVideoId === video.id"
        @mouseenter="handleMouseEnter(video)"
        @mouseleave="handleMouseLeave"
      />
    </div>
    
    <t-loading v-if="loading" size="large" />
    <t-empty v-if="!loading && videos.length === 0" description="暂无视频" />
  </div>
</template>

<script lang="ts" setup>
import {ref, onMounted} from 'vue';
import {getAllVideos} from '@/service/VideoService.ts';
import type {Video} from '@/entity/domain/Video.ts';
import VideoCard from '@/components/VideoCard.vue';

const videos = ref<Video[]>([]);
const loading = ref(true);
const hoveredVideoId = ref<string | null>(null);

onMounted(async () => {
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

function handleMouseEnter(video: Video) {
  hoveredVideoId.value = video.id;
}

function handleMouseLeave() {
  hoveredVideoId.value = null;
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
</style>
