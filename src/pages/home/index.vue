<template>
  <div class="home-container">
    <div class="button-group">
      <t-button 
        class="action-button file-button" 
        @click="handleOpenFile"
      >
        <template #icon>
          <t-icon name="folder"></t-icon>
        </template>
        打开文件
      </t-button>
      <t-button 
        class="action-button url-button" 
        @click="handleOpenUrl"
      >
        <template #icon>
          <t-icon name="link"></t-icon>
        </template>
        打开URL
      </t-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { open } from '@tauri-apps/plugin-dialog';
import { convertFileSrc } from '@tauri-apps/api/core';

const handleOpenFile = async () => {
  const selected = await open({
    multiple: false,
    filters: [
      { name: '视频文件', extensions: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'] },
      { name: '所有文件', extensions: ['*'] }
    ]
  });
  if (selected) {
    const fileSrc = convertFileSrc(selected as string);
    // 跳转到播放器页面并传递文件路径
    window.location.href = `/player?src=${encodeURIComponent(fileSrc)}`;
  }
};

const handleOpenUrl = () => {
  // 跳转到URL输入页面
  window.location.href = '/file';
};
</script>
<style scoped lang="less">
.home-container {
  width: 100vw;
  height: 100vh;
  background-color: var(--td-bg-color-page);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.button-group {
  display: flex;
  gap: var(--td-comp-margin-xxxxl);
}

.action-button {
  width: 200px;
  height: 200px;
  border-radius: var(--td-radius-extraLarge);
  background: linear-gradient(145deg, var(--td-bg-color-container), var(--td-bg-color-secondarycontainer));
  box-shadow: var(--td-shadow-3);
  border: 1px solid var(--td-border-level-1-color);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--td-comp-margin-l);
  transition: all 0.3s ease;
  color: var(--td-text-color-primary);
  font-size: var(--td-font-size-body-medium);
  font-weight: 500;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--td-shadow-3);
    background: linear-gradient(145deg, var(--td-bg-color-container-hover), var(--td-bg-color-secondarycontainer-hover));
  }

  &:active {
    transform: translateY(0) scale(0.95);
    box-shadow: var(--td-shadow-1);
    background: linear-gradient(145deg, var(--td-bg-color-container-active), var(--td-bg-color-secondarycontainer-active));
  }

  .t-icon {
    font-size: 48px;
    color: var(--td-text-color-primary);
  }
}

.file-button {
  .t-icon {
    color: var(--td-brand-color);
  }
}

.url-button {
  .t-icon {
    color: var(--td-warning-color);
  }
}
</style>
