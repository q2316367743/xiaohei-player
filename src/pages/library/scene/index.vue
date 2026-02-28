<template>
  <div class="scene-page">
    <div class="scene-header">
      <div class="header-left">
        <t-radio-group v-model="layout" default-value="grid">
          <t-radio-button value="grid">
            <app-icon/>
          </t-radio-button>
          <t-radio-button value="list">
            <view-list-icon/>
          </t-radio-button>
        </t-radio-group>
      </div>
      <div class="header-right">
        <t-select v-model="sortField" :style="{ width: '140px' }" @change="handleSortChange">
          <t-option value="file_name" label="名称"/>
          <t-option value="file_size" label="大小"/>
          <t-option value="file_birthtime" label="文件创建时间"/>
          <t-option value="created_at" label="创建时间"/>
          <t-option value="updated_at" label="更新时间"/>
          <t-option value="duration_ms" label="时长"/>
          <t-option value="release_date" label="发行日期"/>
        </t-select>
        <t-divider layout="vertical"/>
        <div>
          <t-button :theme="sortOrder==='ASC'?'primary' :'default'" shape="square"
                    @click="handleSortOrderChange('ASC')">
            <template #icon>
              <chevron-up-icon/>
            </template>
          </t-button>
          <t-button :theme="sortOrder==='DESC'?'primary' :'default'" shape="square"
                    @click="handleSortOrderChange('DESC')">
            <template #icon>
              <chevron-down-icon/>
            </template>
          </t-button>
        </div>
        <t-divider layout="vertical"/>
        <span>隐藏</span>
        <t-switch v-model="hidden" class="ml-8px" @change="handleSortChange"></t-switch>
      </div>
    </div>

    <div class="scene-content">
      <t-loading v-if="loading" size="large" class="loading-container"/>
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

        <empty-result v-if="videos.length === 0" tip="暂无视频" />

      </template>
    </div>

    <div v-if="total > 0" class="pagination-container">
      <t-pagination
        v-model="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-size-options="[15, 30, 50, 80]"
        @change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>
    <t-back-top container=".scene-content"/>
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
const sortField = useLocalStorage<VideoSortField>(LocalName.PAGE_LIBRARY_SCENE_SORT_FIELD, 'file_name');
const sortOrder = useLocalStorage<SortOrder>(LocalName.PAGE_LIBRARY_SCENE_SORT_ORDER, 'ASC');

const videos = ref<Video[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const pageSize = ref(15);
const total = ref(0);
const hidden = ref(false);

onMounted(async () => {
  await loadVideos();
});

async function loadVideos() {
  loading.value = true;
  try {
    const result = await pageVideo(
      currentPage.value, pageSize.value, sortField.value, sortOrder.value,
      hidden.value ? undefined : 0);
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

function handleSortOrderChange(s: SortOrder) {
  sortOrder.value = s;
  handleSortChange();
}

</script>

<style scoped lang="less">
.scene-page {
  position: relative;
  width: 100%;
  height: 100%;

  .scene-header {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 8px;
    padding-right: 8px;
    background-color: var(--td-bg-color-container);
  }

  .scene-content {
    position: absolute;
    top: 48px;
    left: 0;
    right: 0;
    bottom: 48px;
    overflow-y: auto;
    padding: 8px;
  }

  .pagination-container {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    height: 48px;
    padding-left: 8px;
    padding-right: 8px;
    background-color: var(--td-bg-color-container);
  }
}


.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
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
</style>
