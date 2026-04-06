<template>
  <div class="stream-layout">
    <t-layout class="stream-container">
      <t-aside class="category-aside" width="232px">
        <t-menu
          v-model="activeCategory"
          class="category-menu"
          :expanded="expandedKeys"
          @expand="handleExpand"
        >
          <t-menu-item value="" @click="handleCategory('')">
            <template #icon>
              <app-icon/>
            </template>
            全部
          </t-menu-item>
          <t-submenu
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
            :title="category.name"
          >
            <template #icon>
              <div class="category-cover" v-if="category.cover">
                <t-image :src="category.cover" fit="cover"/>
              </div>
              <div class="category-icon" v-else>
                <folder-icon/>
              </div>
            </template>
            <t-menu-item
              :value="category.id"
              @click="handleCategory(category.id)"
            >
              全部{{ category.name }}
            </t-menu-item>
            <t-menu-item
              v-for="child in category.children"
              :key="child.id"
              :value="child.id"
              @click="handleCategory(child.id)"
            >
              {{ child.name }}
            </t-menu-item>
          </t-submenu>
        </t-menu>
      </t-aside>
      <t-content class="content-area">
        <div
          class="video-grid-container"
          ref="scrollContainer"
          @scroll="handleScroll"
        >
          <div class="video-grid">
            <div
              v-for="item in list"
              :key="item.id"
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
                <div class="video-overlay">
                  <div class="video-type-tag" v-if="item.type">
                    {{ item.type === 'Movie' ? '电影' : '剧集' }}
                  </div>
                  <div class="video-remark" v-if="item.remark">
                    {{ item.remark }}
                  </div>
                </div>
              </div>
              <div class="video-info">
                <div class="video-title" :title="item.title">{{ item.title }}</div>
                <div class="video-meta" v-if="item.releaseYear || item.region">
                  <span v-if="item.releaseYear">{{ item.releaseYear }}</span>
                  <span v-if="item.releaseYear && item.region" class="meta-dot">·</span>
                  <span v-if="item.region">{{ item.region }}</span>
                </div>
                <div class="video-tags" v-if="item.types?.length">
                  <span
                    v-for="(tag, index) in item.types.slice(0, 3)"
                    :key="index"
                    class="tag-item"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="loading-more" v-if="loading">
            <t-loading text="加载中..."/>
          </div>
          <div class="no-more" v-else-if="list.length > 0 && !hasMore">
            <span>已经到底了</span>
          </div>
          <div class="empty-state" v-if="!loading && list.length === 0">
            <t-empty title="暂无数据"/>
          </div>
        </div>
      </t-content>
    </t-layout>
  </div>
</template>

<script lang="ts" setup>
import type {INetworkServer} from "@/module/network/INetworkServer.ts";
import type {NetworkCategory} from "@/module/network/types/NetworkCategory.ts";
import type {NetworkListItem} from "@/module/network/types/NetworkListItem.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {AppIcon, FolderIcon, VideoIcon} from "tdesign-icons-vue-next";
import {LocalName} from "@/global/LocalName.ts";
import {useStreamStore} from "@/store";

const props = defineProps({
  streamId: {
    type: String,
    required: true
  }
});

const router = useRouter();
const client = shallowRef<INetworkServer>();
const categories = ref(new Array<NetworkCategory>());

const loading = ref(false);
const categoryId = useLocalStorage(LocalName.PAGE_STREAM_MENU(props.streamId), '');
const activeCategory = ref('');
const expandedKeys = ref<string[]>([]);
const page = ref(0);
const total = ref(1);
const list = ref(new Array<NetworkListItem>());
const scrollContainer = ref<HTMLElement | null>(null);

const hasMore = computed(() => {
  return list.value.length < total.value;
});

const nextPage = async () => {
  console.log('nextPage', loading.value, hasMore.value)
  if (loading.value || !hasMore.value) return;
  loading.value = true;
  page.value += 1;
  try {
    console.log('getVideos', categoryId.value, page.value)
    const res = await client.value?.getVideos(categoryId.value, page.value);
    if (res) {
      list.value = [...list.value, ...res.data];
      total.value = res.total;
    }
  } catch (e) {
    MessageUtil.error('加载数据失败', e);
  } finally {
    loading.value = false;
  }
};

const handleCategory = (id: string) => {
  categoryId.value = id;
  activeCategory.value = id;
  list.value = [];
  page.value = 0;
  total.value = 1;
  nextPage();
};

const handleExpand = (value: (string | number)[]) => {
  expandedKeys.value = value as string[];
};

const handleScroll = () => {
  if (!scrollContainer.value || loading.value || !hasMore.value) return;
  const {scrollTop, scrollHeight, clientHeight} = scrollContainer.value;
  if (scrollTop + clientHeight >= scrollHeight - 200) {
    nextPage();
  }
};

const handleVideoClick = (item: NetworkListItem) => {
  router.push({
    path: `/stream/detail/${props.streamId}/${item.id}`,
    query: {
      title: item.title
    }
  });
};

onMounted(async () => {
  try {
    client.value = await useStreamStore().getStreamServerClient(props.streamId);
    if (client.value) {
      const [res1] = await Promise.all([
        client.value.home(1),
        nextPage()
      ]);
      categories.value = res1.categories || [];
    }
  } catch (e) {
    MessageUtil.error("初始化数据失败", e);
  }
});
</script>

<style scoped lang="less">
.stream-layout {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.stream-container {
  height: 100%;
  background: var(--td-bg-color-page);
}

.category-aside {
  overflow: auto;
  flex-shrink: 0;
  height: calc(100vh - 56px);
}

.category-header {
  padding: 16px;
  border-bottom: 1px solid var(--td-border-level-1-color);
  flex-shrink: 0;
}

.category-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.category-menu {
  flex: 1;
  overflow-y: auto;
  border: none;
  background: transparent;

  :deep(.t-menu__item) {
    height: 44px;
    margin: 2px 8px;
    border-radius: var(--td-radius-medium);

    &:hover {
      background: var(--td-bg-color-container-hover);
    }

    &.t-is-active {
      background: var(--td-brand-color-1);
      color: var(--td-brand-color);
    }
  }

  :deep(.t-submenu__content) {
    background: transparent;
  }
}

.category-cover {
  width: 24px;
  height: 24px;
  border-radius: var(--td-radius-default);
  overflow: hidden;

  .t-image {
    width: 100%;
    height: 100%;
  }
}

.category-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--td-text-color-secondary);
}

.content-area {
  height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.video-grid-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.video-card {
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-large);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--td-shadow-1);

  &:hover {
    transform: translateY(-6px);
    box-shadow: var(--td-shadow-3);

    .video-cover {
      .cover-image {
        transform: scale(1.05);
      }

      .video-overlay {
        opacity: 1;
      }
    }
  }
}

.video-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  background: var(--td-bg-color-secondarycontainer);
}

.cover-image {
  width: 100%;
  height: 100%;
  transition: transform 0.4s ease;
}

.cover-placeholder,
.cover-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--td-bg-color-secondarycontainer);
}

.placeholder-icon {
  font-size: 48px;
  color: var(--td-text-color-placeholder);
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom,
  transparent 0%,
  transparent 50%,
  rgba(0, 0, 0, 0.7) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 12px;
}

.video-type-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  background: var(--td-brand-color);
  color: #fff;
  font-size: 11px;
  border-radius: var(--td-radius-default);
  font-weight: 500;
}

.video-remark {
  color: #fff;
  font-size: 12px;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-info {
  padding: 12px;
}

.video-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.video-meta {
  font-size: 12px;
  color: var(--td-text-color-secondary);
  margin-top: 4px;
  display: flex;
  align-items: center;
}

.meta-dot {
  margin: 0 4px;
}

.video-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.tag-item {
  padding: 2px 6px;
  background: var(--td-bg-color-secondarycontainer);
  color: var(--td-text-color-secondary);
  font-size: 11px;
  border-radius: var(--td-radius-default);
}

.loading-more,
.no-more {
  padding: 24px;
  text-align: center;
  color: var(--td-text-color-secondary);
  font-size: 13px;
}

.empty-state {
  padding: 60px 20px;
}

@media (max-width: 1200px) {
  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 900px) {
  .category-aside {
    width: 180px !important;
  }

  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
}
</style>
