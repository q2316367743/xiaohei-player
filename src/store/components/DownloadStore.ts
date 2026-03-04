import {defineStore} from "pinia";
import {type DownloadResult} from "@/module/download";
import {pluginDownload} from "@/module/download/components/download";
import MessageUtil from "@/util/model/MessageUtil.ts";

export interface DownloadTask {
  id: string;
  result: DownloadResult;
  progress: number;
  total: number;
  transferSpeed: number;
  title: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  error?: string;
}

export const useDownloadStore = defineStore('download', () => {
  const tasks = ref<DownloadTask[]>([]);
  const collapsed = ref(false);
  const sidebarVisible = ref(false);

  const addTask = (result: DownloadResult) => {
    const task: DownloadTask = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      result,
      progress: 0,
      total: 100,
      transferSpeed: 0,
      title: '准备中...',
      status: 'pending'
    };
    tasks.value.unshift(task);
    return task;
  };

  const updateTask = (id: string, updates: Partial<DownloadTask>) => {
    const task = tasks.value.find(t => t.id === id);
    if (task) {
      Object.assign(task, updates);
    }
  };

  const removeTask = (id: string) => {
    const index = tasks.value.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks.value.splice(index, 1);
    }
  };

  const clearCompleted = () => {
    tasks.value = tasks.value.filter(t => t.status !== 'completed');
  };

  const startDownload = async (result: DownloadResult) => {
    const task = addTask(result);
    updateTask(task.id, { status: 'downloading', title: '开始下载...' });
    sidebarVisible.value = true;

    try {
      await pluginDownload(result, (progress) => {
        updateTask(task.id, {
          progress: progress.progress,
          total: progress.total,
          transferSpeed: progress.transferSpeed,
          title: progress.title
        });
      });

      updateTask(task.id, {
        status: 'completed',
        progress: 100,
        title: '下载完成'
      });
      MessageUtil.success(`"${result.title}" 下载完成`);
    } catch (e) {
      updateTask(task.id, {
        status: 'failed',
        title: '下载失败',
        error: e instanceof Error ? e.message : String(e)
      });
      MessageUtil.error(`"${result.title}" 下载失败`, e);
    }
  };

  const toggleCollapsed = () => {
    collapsed.value = !collapsed.value;
  };

  const setCollapsed = (value: boolean) => {
    collapsed.value = value;
  };

  const toggleSidebar = () => {
    sidebarVisible.value = !sidebarVisible.value;
  };

  const setSidebarVisible = (value: boolean) => {
    sidebarVisible.value = value;
  };

  return {
    tasks,
    collapsed,
    sidebarVisible,
    addTask,
    updateTask,
    removeTask,
    clearCompleted,
    startDownload,
    toggleCollapsed,
    setCollapsed,
    toggleSidebar,
    setSidebarVisible
  };
});
