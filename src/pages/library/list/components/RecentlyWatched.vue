<template>
  <div class="recently-watched">
    <div class="section-title">最近观看</div>
    <div class="video-grid" v-if="videos.length > 0">
      <video-card
        v-for="video in videos"
        :key="video.id"
        :video="video"
      />
    </div>
    <empty-result v-else tip="暂无观看记录"/>
  </div>
</template>

<script lang="ts" setup>
import type {Video} from '@/entity/domain/Video.ts';
import {listLastPlayedVideo} from "@/service/VideoService.ts";
import VideoCard from "@/pages/library/detail/components/VideoCard.vue";

const videos = ref<Video[]>([]);

const initVideos = async () => {
  videos.value = await listLastPlayedVideo();
}

onMounted(() => {
  initVideos();
})
</script>

<style scoped lang="less">
.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin-bottom: 16px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(226px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}
</style>
