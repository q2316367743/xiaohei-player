<template>
  <div class="scene-page">
    <div class="scene-header">
      <div class="header-left">
        <t-radio-group v-model="layout" default-value="grid">
          <t-radio-button value="grid">
            <app-icon />
          </t-radio-button>
          <t-radio-button value="list">
            <view-list-icon />
          </t-radio-button>
        </t-radio-group>
      </div>
      <div class="header-right">
        <t-select v-model="sortField" :style="{ width: '120px' }" @change="handleSortChange">
          <t-option value="file_name" label="名称" />
          <t-option value="file_size" label="大小" />
          <t-option value="created_at" label="创建时间" />
          <t-option value="updated_at" label="更新时间" />
          <t-option value="duration_ms" label="时长" />
          <t-option value="release_date" label="发行日期" />
        </t-select>
        <t-radio-group v-model="sortOrder" @change="handleSortChange">
          <t-radio-button value="ASC">
            <chevron-up-icon />
          </t-radio-button>
          <t-radio-button value="DESC">
            <chevron-down-icon />
          </t-radio-button>
        </t-radio-group>
      </div>
    </div>

    <t-loading v-if="loading" size="large" class="loading-container" />
    <template v-else>
      <div v-if="layout === 'grid'" class="video-grid">
        <VideoCard
          v-for="video in videos"
          :key="video.id"
          :video="video"
        />
      </div>

      <div v-else class="video-list">
        <VideoListItem
          v-for="video in videos"
          :key="video.id"
          :video="video"
        />
      </div>

      <t-empty v-if="videos.length === 0" description="暂无视频" />

      <div v-if="total > 0" class="pagination-container">
        <t-pagination
          v-model="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-size-options="[20, 40, 60, 100]"
          @change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {pageVideo, type VideoSortField, type SortOrder} from '@/service/VideoService.ts';
import type {Video} from '@/entity/domain/Video.ts';
import {AppIcon, ViewListIcon, ChevronUpIcon, ChevronDownIcon} from "tdesign-icons-vue-next";
import {LocalName} from "@/global/LocalName.ts";
import VideoCard from './components/VideoCard.vue';
import VideoListItem from './components/VideoListItem.vue';

const layout = useLocalStorage<'grid' | 'list'>(LocalName.PAGE_LIBRARY_SCENE_LAYOUT, 'grid');

const videos = ref<Video[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const sortField = ref<VideoSortField>('file_name');
const sortOrder = ref<SortOrder>('ASC');

onMounted(async () => {
  await loadVideos();
});

async function loadVideos() {
  loading.value = true;
  try {
    const result = await pageVideo(currentPage.value, pageSize.value, sortField.value, sortOrder.value);
    videos.value = result.records;
    total.value = result.total;
  } catch (e) {
    console.error('加载视频列表失败', e);
  } finally {
    loading.value = false;
  }
}

function handlePageChange(pageInfo: { current: number; pageSize: number }) {
  currentPage.value = pageInfo.current;
  loadVideos();
}

function handlePageSizeChange(newPageSize: number) {
  currentPage.value = 1;
  pageSize.value = newPageSize;
  loadVideos();
}

function handleSortChange() {
  currentPage.value = 1;
  loadVideos();
}
</script>

<style scoped lang="less">
.scene-page {
}

.scene-header {
  margin-bottom: 16px;
  position: sticky;
  left: 0;
  top: 0;
  right: 0;
  z-index: 99;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>
