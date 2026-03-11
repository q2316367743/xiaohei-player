<template>
  <t-card size="small" class="setting-card">
    <div class="log-header">
      <span>日志文件列表</span>
      <t-button theme="primary" @click="refreshLogList">刷新</t-button>
    </div>
    <t-list size="small" split :loading="loading">
      <t-list-item v-for="file in logFiles" :key="file.name">
        <t-list-item-meta :title="file.name">
          <template #description>
            <t-space size="small">
              <t-tag theme="primary">{{ prettyDataUnit(file.size) }}</t-tag>
              <t-tag theme="warning">{{ formatDate(file.modified) }}</t-tag>
            </t-space>
          </template>
        </t-list-item-meta>
        <template #action>
          <t-button theme="primary" @click="openFile(file)">打开</t-button>
        </template>
      </t-list-item>
      <t-empty v-if="!loading && logFiles.length === 0" description="暂无日志文件"/>
    </t-list>
  </t-card>
</template>
<script lang="ts" setup>
import {appLogDir, join} from '@tauri-apps/api/path';
import {readDir, stat} from '@tauri-apps/plugin-fs';
import {openPath} from '@tauri-apps/plugin-opener';
import {isTauri} from '@tauri-apps/api/core';
import MessageUtil from '@/util/model/MessageUtil.ts';
import {formatDate, prettyDataUnit} from "@/util/lang/FormatUtil.ts";

interface LogFile {
  name: string;
  path: string;
  size: number;
  modified: number;
}

const logFiles = ref<LogFile[]>([]);
const loading = ref(false);

const refreshLogList = async () => {
  if (!isTauri()) {
    MessageUtil.warning('此功能仅在 Tauri 环境中可用');
    return;
  }

  loading.value = true;
  try {
    const logDir = await appLogDir();
    const entries = await readDir(logDir);

    const files: LogFile[] = [];
    for (const entry of entries) {
      if (entry.isFile && entry.name) {
        const filePath = await join(logDir, entry.name);
        const fileStat = await stat(filePath);
        files.push({
          name: entry.name,
          path: filePath,
          size: fileStat.size,
          modified: fileStat.mtime?.getTime() || Date.now()
        });
      }
    }

    logFiles.value = files.sort((a, b) => b.modified - a.modified);
  } catch (error) {
    MessageUtil.error('获取日志文件失败', error);
    logFiles.value = [];
  } finally {
    loading.value = false;
  }
};

const openFile = async (file: LogFile) => {
  try {
    await openPath(file.path);
  } catch (error) {
    MessageUtil.error('打开文件失败', error);
  }
};

onMounted(() => {
  refreshLogList();
});
</script>
<style scoped lang="less">
.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 16px;

  span {
    font-weight: 500;
    font-size: 16px;
  }
}

.t-list-item {
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--td-bg-color-container-hover);
  }
}
</style>
