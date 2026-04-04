<template>
  <div class="stream-search">
    <div class="search-header">
      <div class="search-input-wrapper">
        <t-input
          v-model="keyword"
          :readonly="loading"
          placeholder="请输入关键字搜索影视"
          class="search-input"
          @enter="search"
          clearable
        />
        <t-button
          :loading="loading"
          theme="primary"
          class="search-btn"
          @click="search"
        >
          搜索
        </t-button>
      </div>
    </div>

    <div class="search-content" v-if="list.length > 0 || loading">
      <div class="result-info" v-if="list.length > 0">
        找到 <span class="highlight">{{ list.length }}</span> 个相关结果
      </div>

      <div class="video-grid">
        <div
          v-for="(item, index) in list"
          :key="index"
          class="video-card"
          @click="handleVideoClick(item)"
        >
          <div class="video-cover">
            <t-image
              :src="item.cover"
              fit="cover"
              class="cover-image"
              lazy
            >
              <template #error>
                <div class="cover-placeholder">
                  <video-icon class="placeholder-icon"/>
                </div>
              </template>
              <template #loading>
                <div class="cover-loading">
                  <t-loading size="small"/>
                </div>
              </template>
            </t-image>
            <div class="source-badge">
              <span class="source-count">{{ item.items.length }}</span>
              <span class="source-label">源</span>
            </div>
            <div class="video-overlay">
              <div class="video-type-tag" v-if="item.items[0]?.data.type">
                {{ item.items[0].data.type === 'Movie' ? '电影' : '剧集' }}
              </div>
            </div>
          </div>
          <div class="video-info">
            <div class="video-title" :title="item.title">{{ item.title }}</div>
            <div class="video-subtitle" v-if="item.subtitle" :title="item.subtitle">
              {{ item.subtitle }}
            </div>
            <div class="video-meta" v-if="item.items[0]?.data.releaseYear || item.items[0]?.data.region">
              <span v-if="item.items[0].data.releaseYear">{{ item.items[0].data.releaseYear }}</span>
              <span v-if="item.items[0].data.releaseYear && item.items[0].data.region" class="meta-dot">·</span>
              <span v-if="item.items[0].data.region">{{ item.items[0].data.region }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="loading-wrapper" v-if="loading">
        <t-loading text="搜索中..." size="large"/>
      </div>
    </div>

    <div class="empty-state" v-else-if="!loading && searched">
      <t-empty title="未找到相关结果" description="试试其他关键词"/>
    </div>

    <div class="initial-state" v-else>
      <t-empty title="输入关键词开始搜索" description="支持搜索电影、电视剧等影视资源"/>
    </div>

    <t-drawer
      v-model:visible="detailVisible"
      header="影视详情"
      :footer="false"
      size="900px"
      :attach="'body'"
      class="detail-dialog"
    >
      <template #header>
        <div class="dialog-header">
          <span class="dialog-title">影视详情</span>
          <div class="source-selector">
            <span class="source-label-text">当前源：</span>
            <t-select
              v-model="currentSourceIndex"
              :style="{ width: '200px' }"
              @change="handleSourceChange"
            >
              <t-option
                v-for="(source, index) in currentItem?.items"
                :key="index"
                :value="index"
                :label="source.sourceName"
              />
            </t-select>
          </div>
        </div>
      </template>

      <div class="detail-content" v-if="currentItem">
        <div class="detail-body">
          <div class="detail-poster">
            <t-image
              :src="currentSource?.cover"
              fit="cover"
              class="poster-image"
            >
              <template #error>
                <div class="poster-placeholder">
                  <video-icon class="placeholder-icon"/>
                </div>
              </template>
            </t-image>
          </div>

          <div class="detail-info">
            <h2 class="detail-title">{{ currentSource?.title }}</h2>
            <div class="detail-subtitle" v-if="currentSource?.subtitle">
              {{ currentSource.subtitle }}
            </div>

            <div class="detail-meta">
              <div class="meta-item" v-if="currentSource?.type">
                <span class="meta-label">类型：</span>
                <span class="meta-value">{{ currentSource.type === 'Movie' ? '电影' : '剧集' }}</span>
              </div>
              <div class="meta-item" v-if="currentSource?.releaseYear">
                <span class="meta-label">年份：</span>
                <span class="meta-value">{{ currentSource.releaseYear }}</span>
              </div>
              <div class="meta-item" v-if="currentSource?.region">
                <span class="meta-label">地区：</span>
                <span class="meta-value">{{ currentSource.region }}</span>
              </div>
              <div class="meta-item" v-if="currentSource?.language">
                <span class="meta-label">语言：</span>
                <span class="meta-value">{{ currentSource.language }}</span>
              </div>
              <div class="meta-item" v-if="currentSource?.duration">
                <span class="meta-label">时长：</span>
                <span class="meta-value">{{ currentSource.duration }}</span>
              </div>
              <div class="meta-item" v-if="currentSource?.total">
                <span class="meta-label">集数：</span>
                <span class="meta-value">{{ currentSource.total }}集</span>
              </div>
              <div class="meta-item" v-if="currentSource?.remark">
                <span class="meta-label">状态：</span>
                <span class="meta-value">{{ currentSource.remark }}</span>
              </div>
            </div>

            <div class="detail-tags" v-if="currentSource?.types?.length">
              <span class="tag-label">标签：</span>
              <div class="tags-wrapper">
                <t-tag
                  v-for="(tag, index) in currentSource.types"
                  :key="index"
                  theme="primary"
                  variant="light"
                >
                  {{ tag }}
                </t-tag>
              </div>
            </div>

            <div class="detail-people" v-if="currentSource?.directors?.length">
              <span class="people-label">导演：</span>
              <span class="people-value">{{ currentSource.directors.join(' / ') }}</span>
            </div>

            <div class="detail-people" v-if="currentSource?.actors?.length">
              <span class="people-label">主演：</span>
              <span class="people-value">{{ currentSource.actors.join(' / ') }}</span>
            </div>

            <div class="detail-content-text" v-if="currentSource?.content">
              <div class="content-label">剧情简介：</div>
              <div class="content-text" v-text="currentSource.content"/>
            </div>
          </div>
        </div>

        <div class="detail-chapters" v-if="currentSource?.chapters?.length">
          <div class="chapters-header">
            <span class="chapters-title">选集</span>
            <span class="chapters-count">共 {{ currentSource.chapters.length }} 集</span>
          </div>
          <div class="chapters-list">
            <div
              v-for="chapter in currentSource.chapters"
              :key="chapter.id"
              class="chapter-item"
            >
              <div class="chapter-name">{{ chapter.name }}</div>
              <div class="chapter-episodes">
                <t-tag
                  v-for="(episode, idx) in chapter.items"
                  :key="idx"
                  variant="outline"
                  theme="primary"
                  class="episode-tag"
                >
                  {{ episode.name }}
                </t-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </t-drawer>
  </div>
</template>

<script lang="ts" setup>
import {getStreamServerForSearch} from "@/service";
import type {INetworkServer} from "@/module/network/INetworkServer.ts";
import type {NetworkListItem} from "@/module/network/types/NetworkListItem.ts";
import {VideoIcon} from "tdesign-icons-vue-next";

interface SearchResultItem {
  sourceId: string;
  sourceName: string;
  data: NetworkListItem;
}

interface SearchResult {
  title: string;
  index: number;
  cover: string;
  subtitle: string;
  releaseDate: string;
  items: Array<SearchResultItem>;
}

const clients = ref<Array<INetworkServer>>();
const keyword = ref('');
const list = ref<Array<SearchResult>>([]);
const loading = ref(false);
const searched = ref(false);

const detailVisible = ref(false);
const currentItem = ref<SearchResult | null>(null);
const currentSourceIndex = ref(0);

const currentSource = computed(() => {
  if (!currentItem.value) return null;
  return currentItem.value.items[currentSourceIndex.value]?.data;
});

const search = async () => {
  if (!clients.value) return;
  if (loading.value) return;
  if (!keyword.value.trim()) return;

  loading.value = true;
  searched.value = true;
  list.value = [];

  try {
    const results = await Promise.allSettled(
      clients.value.map(e => e.searchVideos(keyword.value, 1))
    );

    results.forEach((result, clientIndex) => {
      if (result.status !== 'fulfilled') return;
      
      const client = clients.value?.[clientIndex];
      if (!client) return;
      
      const sourceId = client.props.id;
      const sourceName = client.props.name;

      for (const datum of result.value.data) {
        let found = false;
        for (const item of list.value) {
          if (datum.title === item.title) {
            item.items.push({
              sourceId,
              sourceName,
              data: datum
            });
            found = true;
            break;
          }
        }
        if (!found) {
          list.value.push({
            index: 0,
            cover: datum.cover,
            title: datum.title,
            subtitle: datum.subtitle,
            releaseDate: datum.releaseDate,
            items: [{
              sourceId,
              sourceName,
              data: datum
            }]
          });
        }
      }
    });
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const handleVideoClick = (item: SearchResult) => {
  currentItem.value = item;
  currentSourceIndex.value = item.index;
  detailVisible.value = true;
};

const handleSourceChange = (value: unknown) => {
  if (currentItem.value && typeof value === 'number') {
    currentItem.value.index = value;
  }
};

onMounted(async () => {
  clients.value = await getStreamServerForSearch();
});
</script>

<style scoped lang="less">
@import "StreamSearch.less";
</style>
