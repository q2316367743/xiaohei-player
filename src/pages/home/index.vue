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
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {useLibrarySettingStore} from "@/lib/store.ts";

const router = useRouter();

const handleOpenFile = async () => {
  const librarySetting = await useLibrarySettingStore().get();
  const selected = await open({
    multiple: false,
    filters: [
      { name: '视频文件', extensions: librarySetting.videoExtname },
      { name: '所有文件', extensions: ['*'] }
    ]
  });
  if (selected) {
    // 跳转到播放器页面并传递文件路径
    await router.push({
      path: '/player/link',
      query: {
        type: 'file',
        src: selected
      }
    });
  }
};

const handleOpenUrl = () => {
  // 跳转到URL输入页面
  MessageBoxUtil.prompt("请输入您要播放的资源链接地址，一次仅可以识别1个链接", "打开链接", {
    confirmButtonText: '播放',
    cancelButtonText: '取消',
    inputPlaceholder: '支持HTTP、HTTPS、FTP、磁力链、电驴链接、迅雷链接等'
  }).then(url => {
    if (!url) return;
    router.push({
      path: '/player/link',
      query: {
        type: 'url',
        src: url
      }
    });
  })
};
</script>
<style scoped lang="less">
.home-container {
  width: 100%;
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
