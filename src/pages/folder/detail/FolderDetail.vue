<template>
  <div class="folder-detail-container">
    <div class="toolbar">
      <div class="toolbar-left">
        <t-button variant="outline" shape="circle" :disabled="isRootPath" @click="handleGoBack">
          <template #icon>
            <t-icon name="chevron-left"></t-icon>
          </template>
        </t-button>
        <t-button variant="outline" shape="circle" @click="handleGoHome">
          <template #icon>
            <t-icon name="home"></t-icon>
          </template>
        </t-button>
        <t-button variant="outline" shape="circle" @click="handleRefresh">
          <template #icon>
            <t-icon name="refresh"></t-icon>
          </template>
        </t-button>
      </div>
      <div class="breadcrumb">
        <div class="breadcrumb-item" v-for="(item, index) in pathSegments" :key="index" @click="handlePathClick(index)">
          <span class="breadcrumb-text">{{ item }}</span>
          <t-icon name="chevron-right" class="breadcrumb-separator" v-if="index < pathSegments.length - 1"></t-icon>
        </div>
      </div>
    </div>

    <div class="file-list">
      <div v-if="loading" class="loading-state">
        <t-icon name="loading" class="loading-icon"></t-icon>
        <p class="loading-text">加载中...</p>
      </div>
      <div v-else-if="filteredFiles.length === 0" class="empty-state">
        <t-icon name="folder-open" class="empty-icon"></t-icon>
        <p class="empty-text">此文件夹为空</p>
      </div>
      <div v-else class="file-grid">
        <div v-for="item in filteredFiles" :key="item.path" class="file-item" @click="handleFileClick(item)">
          <div class="file-icon-wrapper">
            <folder-icon v-if="item.isDirectory" class="file-icon"/>
            <template v-else-if="item.isFile">
              <img v-if="item.cover" :src="item.cover" class="file-cover" alt=""/>
              <file-icon v-else class="file-icon"/>
            </template>
          </div>
          <div class="file-name" :title="item.name">{{ item.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useLibrarySettingStore} from "@/lib/store.ts";
import type {FileBrowser, FileItem} from "@/module/file";
import { FileIcon, FolderIcon } from "tdesign-icons-vue-next";
import {filterVideoFileList} from "@/module/file/util.ts";

const router = useRouter();

const props = defineProps({
  adapter: {
    type: Object as PropType<FileBrowser>,
    required: true
  },
  folderId: {
    type: String,
    default: ''
  }
});

const currentPath = ref('/');
const files = ref<FileItem[]>([]);
const loading = ref(false);
const folderExtname = ref<string[]>([]);

const pathSegments = computed(() => {
  if (currentPath.value === '/' || currentPath.value === '') {
    return ['/'];
  }
  const parts = currentPath.value.split('/').filter(p => p);
  return ['/', ...parts];
});

const isRootPath = computed(() => {
  return currentPath.value === '/' || currentPath.value === '';
});

const filteredFiles = computed(() => {
  return filterVideoFileList(files.value, folderExtname.value, props.adapter);
});

onMounted(async () => {
  await loadSettings();
  await loadFiles();
});

async function loadSettings() {
  const settings = await useLibrarySettingStore().get();
  folderExtname.value = settings.folderExtname || [];
}

async function loadFiles() {
  loading.value = true;
  try {
    files.value = await props.adapter.list(currentPath.value);
  } catch (error) {
    console.error('加载文件失败:', error);
    files.value = [];
  } finally {
    loading.value = false;
  }
}

function handleGoBack() {
  if (currentPath.value === '/' || currentPath.value === '') {
    return;
  }
  const parts = currentPath.value.split('/').filter(p => p);
  if (parts.length === 1) {
    currentPath.value = '/';
  } else {
    currentPath.value = '/' + parts.slice(0, -1).join('/');
  }
  loadFiles();
}

function handleGoHome() {
  router.back();
}

function handleRefresh() {
  loadFiles();
}

function handlePathClick(index: number) {
  if (index === 0) {
    currentPath.value = '/';
  } else {
    const parts = currentPath.value.split('/').filter(p => p);
    currentPath.value = '/' + parts.slice(0, index).join('/');
  }
  loadFiles();
}

function handleFileClick(item: FileItem) {
  if (item.isDirectory) {
    currentPath.value = item.path;
    loadFiles();
  } else if (item.isFile) {
    router.push({
      path: '/player/folder',
      query: {
        folderId: props.folderId,
        src: item.path
      }
    });
  }
}
</script>

<style scoped lang="less">
@import "less/FolderDetail.less";
</style>