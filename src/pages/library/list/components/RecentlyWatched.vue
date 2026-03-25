<template>
  <div class="recently-watched">
    <div class="section-header">
      <div class="section-title">最近观看</div>
      <div class="scroll-buttons">
        <t-button 
          :disabled="!canScrollLeft" 
          variant="text" 
          size="small" 
          @click="scrollLeft"
        >
          <template #icon><ChevronLeftIcon /></template>
        </t-button>
        <t-button 
          :disabled="!canScrollRight" 
          variant="text" 
          size="small" 
          @click="scrollRight"
        >
          <template #icon><ChevronRightIcon /></template>
        </t-button>
      </div>
    </div>
    <div 
      class="video-grid" 
      ref="scrollContainer"
      @scroll="handleScroll"
      v-if="videos.length > 0"
    >
      <video-card
        v-for="video in videos"
        :key="video.id"
        :video="video"
        width="226px"
      />
    </div>
    <t-empty v-else title="暂无观看记录"/>
  </div>
</template>

<script lang="ts" setup>
import type {Video} from '@/entity/domain/Video.ts';
import {listLastPlayedVideo} from "@/service/video/VideoService.ts";
import VideoCard from "@/pages/library/detail/components/VideoCard.vue";
import { ChevronLeftIcon, ChevronRightIcon } from 'tdesign-icons-vue-next';

const videos = ref<Video[]>([]);
const scrollContainer = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

const initVideos = async () => {
  videos.value = await listLastPlayedVideo();
  nextTick(() => {
    updateScrollButtons();
  });
}

const handleScroll = () => {
  updateScrollButtons();
}

const updateScrollButtons = () => {
  if (!scrollContainer.value) return;
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value;
  canScrollLeft.value = scrollLeft > 0;
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth;
}

const scrollLeft = () => {
  if (!scrollContainer.value) return;
  scrollContainer.value.scrollBy({ left: -window.innerWidth, behavior: 'smooth' });
}

const scrollRight = () => {
  if (!scrollContainer.value) return;
  scrollContainer.value.scrollBy({ left: window.innerWidth, behavior: 'smooth' });
}

onMounted(() => {
  initVideos();
})
</script>

<style scoped lang="less">
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.scroll-buttons {
  display: flex;
  gap: 4px;
}

.video-grid {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  padding-bottom: 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
