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
        <t-list size="small">
          <t-list-item v-for="task in tasks" :key="task.id" class="download-item">
            <div>
              <t-list-item-meta :title="task.result.title">
                <template #description>
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
                </template>
              </t-list-item-meta>
              <t-alert theme="error" v-if="task.status === 'failed'">
                <span>{{ task.error || '下载失败' }}</span>
              </t-alert>
              <t-tag :theme="getStatusTheme(task.status)" size="small">{{ getStatusText(task.status) }}</t-tag>
            </div>
            <template #action>
              <t-button v-if="task.status === 'failed'" size="small" variant="outline" @click="handleRetry(task)">重试
              </t-button>
              <t-button v-else-if="task.status === 'completed'" size="small" variant="text"
                        @click="handleRemoveTask(task.id)">移除
              </t-button>
            </template>
          </t-list-item>
        </t-list>

      </div>
    </t-card>
  </div>
</template>

<script lang="ts" setup>
import {useDownloadStore} from "@/store";
import {storeToRefs} from "pinia";
import {prettyDataUnit} from "@/util/lang/FormatUtil.ts";

const downloadStore = useDownloadStore();
const {tasks} = storeToRefs(downloadStore);

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

const formatSpeed = (bytesPerSecond: number) => {
  if (bytesPerSecond < 1024) {
    return `${bytesPerSecond.toFixed(2)} B/s`;
  } else if (bytesPerSecond < 1024 * 1024) {
    return `${(bytesPerSecond / 1024).toFixed(2)} KB/s`;
  } else {
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(2)} MB/s`;
  }
};
</script>

<style scoped lang="less">
.download-list-card {
  height: 100%;
  border: none;
  background: transparent;
  box-shadow: none;
}


.download-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--td-component-border);
  background: linear-gradient(180deg, var(--td-bg-color-container) 0%, var(--td-bg-color-secondarycontainer) 100%);
  box-shadow: var(--td-shadow-2);
}


.download-list-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.download-list-actions {
  padding: 12px 16px;
  border-bottom: 1px solid var(--td-component-border);
  background: var(--td-bg-color-container);
}


.download-list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  overflow-y: auto;
}

.download-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: var(--td-text-color-placeholder);
  gap: 12px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInItem {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.download-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.download-item-title {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
}

.download-item-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.download-item-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: var(--td-text-color-secondary);
  padding: 6px 10px;
  background: linear-gradient(145deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.04) 100%);
  border-radius: var(--td-radius-small);
  border: 1px solid var(--td-component-border);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.download-item-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  color: var(--td-error-color);
  padding: 12px;
  background: linear-gradient(145deg, var(--td-error-color-1) 0%, var(--td-error-color-2) 100%);
  border-radius: var(--td-radius-medium);
  border: 1px solid var(--td-error-color-3);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.download-item-success {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  color: var(--td-success-color);
  padding: 12px;
  background: linear-gradient(145deg, var(--td-success-color-1) 0%, var(--td-success-color-2) 100%);
  border-radius: var(--td-radius-medium);
  border: 1px solid var(--td-success-color-3);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
  animation: successPulse 0.5s ease-out;
}

@keyframes successPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}
</style>
