<template>
  <div class="p-8px pl-0">
    <t-card class="download-list-card" title="下载列表" size="small">
      <div v-if="hasCompleted" class="download-list-actions">
        <t-button size="small" variant="text" @click="handleClearCompleted">
          清除已完成
        </t-button>
      </div>
      <div class="download-list-content">
        <div v-if="tasks.length === 0" class="download-empty">
          <t-icon name="download" size="48px"/>
          <span>暂无下载任务</span>
        </div>
        <t-list size="small" split>
          <t-list-item v-for="task in tasks" :key="task.id" class="download-item">
            <div>
              <div class="download-item-title">{{ task.result.title }}</div>
              <div v-if="task.status === 'downloading'" class="download-item-progress">
                <t-progress :percentage="task.progress/task.total" :label="true" size="small">
                  <template #label>
                    <div>{{ prettyDataUnit(task.progress) }} / {{ prettyDataUnit(task.total) }}</div>
                  </template>
                </t-progress>
                <div class="download-item-info">
                  <span>{{ task.title }}</span>
                  <span v-if="task.transferSpeed > 0">{{ formatSpeed(task.transferSpeed) }}</span>
                </div>
              </div>
              <t-alert theme="error" v-if="task.status === 'failed'">
                <span>{{ task.error || '下载失败' }}</span>
              </t-alert>
              <t-button v-if="task.status === 'failed'" theme="warning" size="small"
                        @click="handleRetry(task)">重试
              </t-button>
              <t-button v-else-if="task.status === 'completed'" theme="danger" size="small"
                        @click="handleRemoveTask(task.id)">移除
              </t-button>
            </div>
            <template #action>
              <t-tag :theme="getStatusTheme(task.status)" size="small">{{ getStatusText(task.status) }}</t-tag>
            </template>
          </t-list-item>
        </t-list>

      </div>
    </t-card>
  </div>
</template>

<script lang="ts" setup>
import {type DownloadTask, useDownloadStore} from "@/store";
import {prettyDataUnit} from "@/util/lang/FormatUtil.ts";

const downloadStore = useDownloadStore();
const tasks = computed<Array<DownloadTask>>(() => downloadStore.tasks);

const hasCompleted = computed(() => tasks.value.some((t: any) => t.status === 'completed'));


const handleClearCompleted = () => {
  downloadStore.clearCompleted();
};

const handleRetry = (task: any) => {
  downloadStore.startDownload(task.result);
};

const handleRemoveTask = (id: string) => {
  downloadStore.removeTask(id);
};

const getStatusTheme = (status: string) => {
  const themes: Record<string, any> = {
    pending: 'default',
    downloading: 'primary',
    completed: 'success',
    failed: 'danger'
  };
  return themes[status] || 'default';
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '等待中',
    downloading: '下载中',
    completed: '已完成',
    failed: '失败'
  };
  return texts[status] || status;
};

const formatSpeed = (bytesPerSecond: number) => `${prettyDataUnit(bytesPerSecond)}/s`;
</script>

<style scoped lang="less">
@import "less/DownloadList.less";
</style>
