<template>
  <sub-page-layout :title="library?.name">
    <template #action>
      <div class="flex h-32px items-center">
        <t-select v-model="layout" style="width: 124px;">
          <t-option value="grid" label="网格"/>
          <t-option value="list" label="列表"/>
          <t-option value="waterfall" label="瀑布流"/>
        </t-select>
        <t-divider layout="vertical"/>
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
      </div>
    </template>
    <div class="scene-page">
      <div ref="scrollContainerRef" class="scene-content">
        <t-loading v-if="loading && videos.length === 0" size="large" class="loading-container"/>
        <template v-else>
          <div v-if="layout === 'grid'" class="video-grid">
            <VideoCard
              v-for="video in videos"
              :key="video.id"
              :video="video"
            />
          </div>

          <div v-else-if="layout === 'list'" class="video-list">
            <VideoListItem
              v-for="video in videos"
              :key="video.id"
              :video="video"
            />
          </div>

          <div v-else-if="layout==='waterfall'" class="video-waterfall">
            <VideoWaterfall
              v-for="video in videos"
              :key="video.id"
              :video="video"/>
          </div>

          <empty-result v-if="videos.length === 0" tip="暂无视频"/>

          <div v-if="loadingMore" class="loading-more">
            <t-loading size="small"/>
            <span>加载中...</span>
          </div>

          <div v-else-if="noMore && videos.length > 0" class="no-more">
            没有更多了
          </div>
        </template>
      </div>
      <t-back-top container=".scene-content"/>
    </div>
  </sub-page-layout>
</template>

<script lang="ts" setup>
import {pageVideo, type VideoSortField, type SortOrder, type VideoPageResult} from '@/service/VideoService.ts';
import {ChevronUpIcon, ChevronDownIcon} from "tdesign-icons-vue-next";
import {LocalName} from "@/global/LocalName.ts";
import VideoCard from './components/VideoCard.vue';
import VideoListItem from './components/VideoListItem.vue';
import type {LibraryEntity} from "@/entity/main/LibraryEntity.ts";
import {getLibrary} from "@/service";
import VideoWaterfall from "@/pages/library/detail/components/VideoWaterfall.vue";
import {useInfiniteScroll} from "@vueuse/core";

defineOptions({
  name: 'LibraryDetail'
});

const route = useRoute();

const libraryId = route.params.id as string;

const layout = useLocalStorage<'grid' | 'list' | 'waterfall'>(LocalName.PAGE_LIBRARY_DETAIL_LAYOUT(libraryId), 'grid');
const sortField = useLocalStorage<VideoSortField>(LocalName.PAGE_LIBRARY_DETAIL_SORT_FIELD(libraryId), 'file_name');
const sortOrder = useLocalStorage<SortOrder>(LocalName.PAGE_LIBRARY_DETAIL_SORT_ORDER(libraryId), 'ASC');

const library = ref<LibraryEntity>()
const videos = ref<Array<VideoPageResult>>([]);
const loading = ref(true);
const loadingMore = ref(false);
const noMore = ref(false);
const currentPage = ref(1);
const pageSize = ref(30);
const total = ref(0);

const scrollContainerRef = ref<HTMLElement | null>(null);

async function loadVideos(isLoadMore = false) {
  if (isLoadMore) {
    if (loadingMore.value || noMore.value) return;
    loadingMore.value = true;
  } else {
    loading.value = true;
    currentPage.value = 1;
    videos.value = [];
    noMore.value = false;
  }

  try {
    const result = await pageVideo(libraryId, currentPage.value, pageSize.value, sortField.value, sortOrder.value);
    if (isLoadMore) {
      videos.value = [...videos.value, ...result.records];
    } else {
      videos.value = result.records;
    }
    total.value = result.total;
    noMore.value = videos.value.length >= result.total;
  } catch (e) {
    console.error('加载视频列表失败', e);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

async function loadMore() {
  if (loadingMore.value || noMore.value) return;
  currentPage.value++;
  await loadVideos(true);
}

useInfiniteScroll(
  scrollContainerRef,
  loadMore,
  { distance: 200, interval: 100 }
);

function handleSortChange() {
  loadVideos();
}

function handleSortOrderChange(s: SortOrder) {
  sortOrder.value = s;
  handleSortChange();
}

onActivated(async () => {
  library.value = await getLibrary(libraryId);
  await loadVideos();
});
</script>

<style scoped lang="less">
.scene-page {
  position: relative;
  width: 100%;
  height: 100%;

  .scene-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    padding: 8px;
  }
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(226px, 1fr));
  gap: 16px;
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.video-waterfall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loading-more {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 16px;
  color: var(--td-text-color-secondary);
}

.no-more {
  text-align: center;
  padding: 16px;
  color: var(--td-text-color-placeholder);
  font-size: 14px;
}
</style>
