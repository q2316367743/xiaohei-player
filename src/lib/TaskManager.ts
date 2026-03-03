import type {Task} from "@/entity/main/Task.ts";

type TaskExecutor = (onProgress: (progress: number, total: number, message: string) => void) => Promise<void>;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

class TaskManager {
  public currentTask = ref<Task>();

  addTask(name: string, executor: TaskExecutor): Task {
    const task: Task = {
      id: generateId(),
      name,
      status: 'pending',
      progress: 0,
      total: 0,
      message: '等待中...',
      logs: [],
      created_at: Date.now(),
      updated_at: Date.now()
    };

    this.executeTask(task, executor);

    return task;
  }

  private async executeTask(task: Task, executor: TaskExecutor) {
    if (this.currentTask.value) {
      return;
    }

    this.currentTask.value = task;
    this.currentTask.value.status = 'running';
    this.currentTask.value.message = '执行中...';

    try {
      await executor((progress: number, total: number, message: string) => {
        if (!this.currentTask.value) return;
        this.currentTask.value.progress = progress;
        this.currentTask.value.total = total;
        this.currentTask.value.message = message;
        this.currentTask.value.logs.push(message);
        this.currentTask.value.updated_at = Date.now();
      });

      this.currentTask.value.status = 'completed';
      this.currentTask.value.message = '已完成';
      this.currentTask.value.logs.push('任务完成');
      this.currentTask.value.updated_at = Date.now();
    } catch (error) {
      this.currentTask.value.status = 'failed';
      this.currentTask.value.message = '执行失败';
      this.currentTask.value.logs.push(`错误: ${error}`);
      this.currentTask.value.updated_at = Date.now();
      console.error(error);
    } finally {
      this.currentTask.value = undefined;
    }
  }


  isRunning(): boolean {
    return this.currentTask.value !== null;
  }

}

export const taskManager = new TaskManager();
