<template>
  <div class="folder-detail-container">
    <div class="toolbar">
      <div class="toolbar-left">
        <t-button variant="outline" shape="circle" @click="handleGoBack">
          <template #icon>
            <t-icon name="chevron-left"></t-icon>
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
            <t-icon :name="getFileIcon(item)" class="file-icon"></t-icon>
          </div>
          <div class="file-name" :title="item.name">{{ item.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useLibrarySettingStore} from "@/lib/store";
import type {FileBrowser, FileItem} from "@/module/file";

const router = useRouter();

const props = defineProps({
  adapter: {
    type: Object as PropType<FileBrowser>,
    required: true
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

const filteredFiles = computed(() => {
  return files.value.filter(item => {
    if (item.isDirectory) {
      return true;
    }
    const ext = item.extname.toLowerCase().replace('.', '');
    return folderExtname.value.includes(ext);
  });
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
  }
}

function getFileIcon(item: FileItem): string {
  if (item.isDirectory) {
    return 'folder';
  }
  return 'video';
}
</script>

<style scoped lang="less">
.folder-detail-container {
  width: 100%;
  height: 100%;
  background-color: var(--td-bg-color-page);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-l);
  background: linear-gradient(180deg, var(--td-bg-color-container) 0%, var(--td-bg-color-secondarycontainer) 100%);
  border-bottom: 1px solid var(--td-border-level-1-color);
  box-shadow: var(--td-shadow-1);
  gap: var(--td-comp-margin-m);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: var(--td-comp-margin-s);
  flex-shrink: 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  flex: 1;
  overflow-x: auto;
  gap: var(--td-comp-margin-xs);
  padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-m);
  background: linear-gradient(145deg, var(--td-bg-color-page), var(--td-bg-color-container));
  border-radius: var(--td-radius-medium);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--td-border-level-1-color);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingLR-s);
  border-radius: var(--td-radius-small);

  &:hover {
    background-color: var(--td-bg-color-component-hover);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.breadcrumb-text {
  font-size: var(--td-font-size-body-medium);
  color: var(--td-text-color-primary);
  white-space: nowrap;
}

.breadcrumb-separator {
  font-size: var(--td-font-size-body-small);
  color: var(--td-text-color-placeholder);
  margin: 0 var(--td-comp-margin-xs);
}

.file-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--td-comp-paddingTB-l) var(--td-comp-paddingLR-l);
}

.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--td-text-color-secondary);
}

.loading-icon {
  font-size: 48px;
  color: var(--td-brand-color);
  animation: spin 1s linear infinite;
  margin-bottom: var(--td-comp-margin-l);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: var(--td-font-size-body-medium);
  color: var(--td-text-color-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--td-text-color-secondary);
}

.empty-icon {
  font-size: 80px;
  color: var(--td-gray-color-4);
  margin-bottom: var(--td-comp-margin-l);
  opacity: 0.5;
}

.empty-text {
  font-size: var(--td-font-size-body-large);
  color: var(--td-text-color-secondary);
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--td-comp-margin-m);
}

.file-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--td-comp-paddingTB-l) var(--td-comp-paddingLR-m);
  background: linear-gradient(145deg, var(--td-bg-color-container), var(--td-bg-color-secondarycontainer));
  border-radius: var(--td-radius-medium);
  box-shadow: var(--td-shadow-1);
  border: 1px solid var(--td-border-level-1-color);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
    border-radius: var(--td-radius-medium);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--td-shadow-2);
    border-color: var(--td-border-level-2-color);
    background: linear-gradient(145deg, var(--td-bg-color-container-hover), var(--td-bg-color-secondarycontainer-hover));
  }

  &:active {
    transform: translateY(-2px) scale(0.98);
    box-shadow: var(--td-shadow-1);
  }
}

.file-icon-wrapper {
  width: 64px;
  height: 64px;
  background: linear-gradient(145deg, var(--td-brand-color-light), var(--td-brand-color-light-hover));
  border-radius: var(--td-radius-large);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: var(--td-comp-margin-m);
  box-shadow: var(--td-shadow-1);
  position: relative;
  z-index: 1;
}

.file-icon {
  font-size: 36px;
  color: var(--td-brand-color);
}

.file-name {
  font-size: var(--td-font-size-body-small);
  color: var(--td-text-color-primary);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  user-select: none;
  font-weight: 500;
}
</style>