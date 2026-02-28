<template>
  <t-card size="small">
    <sub-title title="任务队列"/>
    <t-card>
      <div v-if="currentTask" class="task-item">
        <div class="task-header">
          <div class="task-name">{{ currentTask.name }}</div>
          <t-tag :theme="getStatusTheme(currentTask.status)">{{ getStatusText(currentTask.status) }}</t-tag>
        </div>
        <div class="task-message">{{ currentTask.message }}</div>
        <div v-if="currentTask.total > 0" class="task-progress">
          <t-progress :percentage="getProgressPercentage(currentTask)" :label="true"/>
        </div>
        <div class="task-logs">
          <div v-for="(log, index) in currentTask.logs.slice(-5)" :key="index" class="log-item">{{ log }}</div>
        </div>
      </div>
      <div v-else class="no-task">
        目前没有任务在运行
      </div>
    </t-card>
    <sub-title title="收藏库"/>
    <t-card>
      <div class="flex justify-between">
        <div>
          <div class="font-size-1.2rem font-bold">扫描</div>
          <div>扫描新内容并添加到数据库中</div>
        </div>
        <div class="flex gap-8px">
          <t-button :disabled="isRunning" @click="handleScan">扫描</t-button>
        </div>
      </div>
      <t-list size="small" split>
        <t-list-item>
          重新扫描文件
          <template #action>
            <t-switch v-model="data.reScanFile" @change="onChange('reScanFile', $event)"/>
          </template>
        </t-list-item>
      </t-list>
    </t-card>
    <sub-title title="生成的内容"/>
    <t-card>
      <div class="flex justify-between">
        <div>
          <div class="font-size-1.2rem font-bold">生成</div>
          <div>生成辅助的图片，预览，片段，字幕等其他文件。</div>
        </div>
      </div>
      <t-list size="small" split>
        <t-list-item>
          短片封面
          <template #action>
            <t-switch v-model="data.shortCover" @change="onChange('shortCover', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          <div>
            预览
            <t-tooltip content="鼠标悬停在短片上时播放的预览短片">
              <help-circle-filled-icon/>
            </t-tooltip>
          </div>
          <template #action>
            <t-switch v-model="data.preview" @change="onChange('preview', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          <div>
            短视频时间轴预览小图
            <t-tooltip content="视频播放器下方用于快速导航的缩略图集。">
              <help-circle-filled-icon/>
            </t-tooltip>
          </div>
          <template #action>
            <t-switch v-model="data.timelinePreviewThumbnail" @change="onChange('timelinePreviewThumbnail', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          <div>
            标记预览
            <t-tooltip content="从给出的时间码开始20秒的视频.">
              <help-circle-filled-icon/>
            </t-tooltip>
          </div>
          <template #action>
            <t-switch v-model="data.markPreview" @change="onChange('markPreview', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          <div>
            标记的屏幕截图
            <t-tooltip content="标记使用静态JPG 图像">
              <help-circle-filled-icon/>
            </t-tooltip>
          </div>
          <template #action>
            <t-switch v-model="data.markScreenshot" @change="onChange('markScreenshot', $event)"/>
          </template>
        </t-list-item>
        <t-list-item>
          覆盖现有文件
          <template #action>
            <t-switch v-model="data.overwriteExistingFile" @change="onChange('overwriteExistingFile', $event)"/>
          </template>
        </t-list-item>
      </t-list>
    </t-card>
    <sub-title title="维护"/>
    <t-card>
      <t-list size="small" split>
        <t-list-item>
          <t-list-item-meta title="清理"
                            description="检查缺失的文件并将它们的数据从数据库中删除。 注意，这是一个破坏性的动作。"/>
          <template #action>
            <t-button theme="danger" :disabled="isRunning" @click="handleCleanDeletedVideo">清理</t-button>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="清除已生成的文件" description="移除没有相应数据库条目的已生成文件。"/>
          <template #action>
            <t-button theme="danger" :disabled="isRunning" @click="handleCleanGenerateFile">清除已生成的文件</t-button>
          </template>
        </t-list-item>
        <t-list-item>
          <t-list-item-meta title="优化数据库">
            <template #description>
              <p>尝试通过分析然后重建整个数据库文件来提高性能。</p>
              <p>警告：当此任务运行时，任何修改数据库的操作都将失败，而且根据数据库的大小，可能需要几分钟才能完成。此外，它至少需要与数据库大小相当的可用磁盘空间，但建议使用
                1.5 倍的空间。</p>
            </template>
          </t-list-item-meta>
          <template #action>
            <t-button theme="danger" :disabled="isRunning" @click="handleCleanDeletedDb">优化数据库</t-button>
          </template>
        </t-list-item>
      </t-list>
    </t-card>
    <sub-title title="元数据"/>
    <sub-title title="备份"/>
    <sub-title title="迁移"/>
  </t-card>
</template>
<script lang="ts" setup>
import SubTitle from "@/components/PageTitle/SubTitle.vue";
import {getTaskSetting, type TaskSetting} from "@/entity/setting/TaskSetting.ts";
import {useTaskSettingStore} from "@/lib/store.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {logDebug} from "@/lib/log.ts";
import {HelpCircleFilledIcon} from "tdesign-icons-vue-next";
import {taskManager} from "@/lib/TaskManager.ts";
import {scanLibrary} from "@/module/library/index.ts";
import {cleanDeletedDb} from "@/module/clean/CleanDeletedDb.ts";
import {cleanDeletedVideo} from "@/module/clean/CleanDeletedVideo.ts";
import {cleanGenerateFile} from "@/module/clean/CleanGenerateFile.ts";

const data = ref<TaskSetting>(getTaskSetting());
const currentTask = ref(taskManager.getCurrentTask());
const isRunning = ref(taskManager.isRunning());

onMounted(() => {
  useTaskSettingStore().get()
    .then((res) => {
      data.value = res;
    })
    .catch(e => MessageUtil.error("获取数据失败", e));

  const unsubscribe = taskManager.subscribe(() => {
    currentTask.value = taskManager.getCurrentTask();
    isRunning.value = taskManager.isRunning();
  });

  onUnmounted(() => {
    unsubscribe();
  });
});

function onChange<K extends keyof TaskSetting>(key: K, value: any) {
  useTaskSettingStore()
    .setItem(key, value)
    .then(() => logDebug("保存成功"))
    .catch(e => MessageUtil.error("保存失败", e));
}

function getStatusTheme(status: string): 'primary' | 'success' | 'danger' | 'default' {
  switch (status) {
    case 'running':
      return 'primary';
    case 'completed':
      return 'success';
    case 'failed':
      return 'danger';
    default:
      return 'default';
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'pending':
      return '等待中';
    case 'running':
      return '执行中';
    case 'completed':
      return '已完成';
    case 'failed':
      return '失败';
    default:
      return status;
  }
}

function getProgressPercentage(task: any): number {
  if (task.total === 0) return 0;
  return Math.round((task.progress / task.total) * 100);
}

async function handleScan() {
  if (isRunning.value) {
    MessageUtil.warning('任务正在执行中，请稍候');
    return;
  }

  try {
    console.log('开始添加扫描任务');
    const task = taskManager.addTask('扫描收藏库', async (onProgress) => {
      console.log('scanLibrary 回调被调用');
      await scanLibrary(onProgress);
    });
    console.log('任务已添加:', task);
  } catch (e) {
    MessageUtil.error('扫描失败', e);
  }
}

async function handleCleanDeletedVideo() {
  if (isRunning.value) {
    MessageUtil.warning('任务正在执行中，请稍候');
    return;
  }

  try {
    taskManager.addTask('清理已删除的视频', async (onProgress) => {
      await cleanDeletedVideo(onProgress);
    });
  } catch (e) {
    MessageUtil.error('清理失败', e);
  }
}

async function handleCleanGenerateFile() {
  if (isRunning.value) {
    MessageUtil.warning('任务正在执行中，请稍候');
    return;
  }

  try {
    taskManager.addTask('清除已生成的文件', async (onProgress) => {
      await cleanGenerateFile(onProgress);
    });
  } catch (e) {
    MessageUtil.error('清除失败', e);
  }
}

async function handleCleanDeletedDb() {
  if (isRunning.value) {
    MessageUtil.warning('任务正在执行中，请稍候');
    return;
  }

  try {
    taskManager.addTask('清理已删除的数据库记录', async (onProgress) => {
      await cleanDeletedDb(onProgress);
    });
  } catch (e) {
    MessageUtil.error('清理失败', e);
  }
}
</script>
<style scoped lang="less">
.task-item {
  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .task-name {
      font-size: 14px;
      font-weight: 500;
    }
  }

  .task-message {
    font-size: 12px;
    color: var(--td-text-color-secondary);
    margin-bottom: 8px;
  }

  .task-progress {
    margin-bottom: 12px;
  }

  .task-logs {
    background: var(--td-bg-color-container);
    border-radius: 4px;
    padding: 8px;
    max-height: 120px;
    overflow-y: auto;

    .log-item {
      font-size: 12px;
      color: var(--td-text-color-secondary);
      margin-bottom: 4px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.no-task {
  text-align: center;
  color: var(--td-text-color-placeholder);
  padding: 20px 0;
}
</style>
