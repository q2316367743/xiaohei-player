<template>
  <div class="folder-local-container">
    <div class="header">
      <h2 class="title">本地文件夹</h2>
      <t-button
        class="add-button"
        @click="handleAddFolder"
      >
        <template #icon>
          <t-icon name="add"></t-icon>
        </template>
        添加文件夹
      </t-button>
    </div>

    <div class="folder-grid" v-if="list.length > 0">
      <div
        v-for="item in list"
        :key="item.id"
        class="folder-card"
        @mouseenter="handleCardEnter(item.id)"
        @mouseleave="handleCardLeave(item.id)"
      >
        <div class="folder-cover">
          <t-icon v-if="item.password" name="lock-on" class="lock-icon"></t-icon>
          <div class="folder-icon-wrapper">
            <t-icon name="folder" class="folder-icon"></t-icon>
          </div>
          <div class="folder-actions">
            <t-dropdown :options="getActionOptions()" trigger="click" @click="(data) => handleActionClick(data, item)">
              <t-button variant="text" class="action-btn">
                <t-icon name="more"></t-icon>
              </t-button>
            </t-dropdown>
          </div>
        </div>
        <div class="folder-info">
          <div class="folder-name" :title="item.name">{{ item.name }}</div>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <t-icon name="folder-open" class="empty-icon"></t-icon>
      <p class="empty-text">暂无本地文件夹</p>
      <t-button theme="primary" @click="handleAddFolder">添加第一个文件夹</t-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useFolderStore} from "@/store/components/FolderStore.ts";
import {addFolderDialog, openUpdateLocalPassword, openDeleteFolderLocal} from "./edit.tsx";

const store = useFolderStore();
const list = computed(() => store.folderLocal);
const hoveredCardId = ref<string | null>(null);

onMounted(() => {
  store.init();
});

function handleAddFolder() {
  addFolderDialog();
}

function handleCardEnter(id: string) {
  hoveredCardId.value = id;
}

function handleCardLeave(id: string) {
  if (hoveredCardId.value === id) {
    hoveredCardId.value = null;
  }
}

function getActionOptions() {
  return [
    {
      content: '修改密码',
      value: 'password'
    },
    {
      content: '删除',
      value: 'delete'
    }
  ];
}

function handleActionClick(data: any, folder: any) {
  if (data.value === 'password') {
    openUpdateLocalPassword(folder);
  } else if (data.value === 'delete') {
    openDeleteFolderLocal(folder);
  }
}
</script>

<style scoped lang="less">
.folder-local-container {
  width: calc(100% - 16px);
  height: calc(100vh - 16px);
  background-color: var(--td-bg-color-page);
  padding: 8px;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--td-comp-margin-xxl);
}

.title {
  font-size: var(--td-font-size-headline-medium);
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0;
}

.add-button {
  background: linear-gradient(145deg, var(--td-brand-color), var(--td-brand-color-hover));
  border: none;
  box-shadow: var(--td-shadow-2);
  transition: all 0.3s ease;
  border-radius: var(--td-radius-medium);
  padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-l);
  color: white;
  font-weight: 500;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--td-shadow-3);
  }

  &:active {
    transform: translateY(0) scale(0.98);
    box-shadow: var(--td-shadow-1);
  }
}

.folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--td-comp-margin-l);
}

.folder-card {
  background: linear-gradient(145deg, var(--td-bg-color-container), var(--td-bg-color-secondarycontainer));
  border-radius: var(--td-radius-medium);
  box-shadow: var(--td-shadow-2);
  border: 1px solid var(--td-border-level-1-color);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--td-shadow-3);
    border-color: var(--td-border-level-2-color);
  }

  &:active {
    transform: translateY(-2px) scale(0.98);
    box-shadow: var(--td-shadow-1);
  }
}

.folder-cover {
  position: relative;
  height: 100px;
  background: linear-gradient(135deg, var(--td-brand-color-light) 0%, var(--td-brand-color-light-hover) 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%);
  }
}

.lock-icon {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 16px;
  color: var(--td-warning-color);
  z-index: 2;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: var(--td-shadow-1);
}

.folder-icon-wrapper {
  position: relative;
  z-index: 1;
  width: 60px;
  height: 60px;
  background: linear-gradient(145deg, var(--td-brand-color), var(--td-brand-color-hover));
  border-radius: var(--td-radius-large);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: var(--td-shadow-2);
}

.folder-icon {
  font-size: 36px;
  color: white;
}

.folder-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}

.action-btn {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: var(--td-shadow-1);

  &:hover {
    background: white;
    transform: scale(1.1);
  }
}

.folder-info {
  padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-m);
  background: linear-gradient(180deg, var(--td-bg-color-container) 0%, var(--td-bg-color-secondarycontainer) 100%);
}

.folder-name {
  font-size: var(--td-font-size-body-medium);
  font-weight: 600;
  color: var(--td-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  user-select: none;
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 200px);
  color: var(--td-text-color-secondary);
}

.empty-icon {
  font-size: 120px;
  color: var(--td-gray-color-4);
  margin-bottom: var(--td-comp-margin-l);
  opacity: 0.5;
}

.empty-text {
  font-size: var(--td-font-size-body-large);
  margin-bottom: var(--td-comp-margin-xl);
  color: var(--td-text-color-secondary);
}
</style>
