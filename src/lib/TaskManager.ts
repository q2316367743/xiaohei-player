import type {Task} from "@/entity/domain/Task.ts";

type TaskExecutor = (onProgress: (progress: number, total: number, message: string) => void) => Promise<void>;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

class TaskManager {
  private tasks: Task[] = [];
  private currentTask: Task | null = null;
  private listeners: Set<() => void> = new Set();

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
    
    this.tasks.push(task);
    this.notifyListeners();
    
    this.executeTask(task, executor);
    
    return task;
  }

  private async executeTask(task: Task, executor: TaskExecutor) {
    if (this.currentTask) {
      return;
    }
    
    this.currentTask = task;
    task.status = 'running';
    task.message = '执行中...';
    this.notifyListeners();
    
    try {
      await executor((progress: number, total: number, message: string) => {
        console.log(progress, total, message)
        task.progress = progress;
        task.total = total;
        task.message = message;
        task.logs.push(message);
        task.updated_at = Date.now();
        this.notifyListeners();
      });
      
      task.status = 'completed';
      task.message = '已完成';
      task.logs.push('任务完成');
      task.updated_at = Date.now();
    } catch (error) {
      task.status = 'failed';
      task.message = '执行失败';
      task.logs.push(`错误: ${error}`);
      task.updated_at = Date.now();
      console.error(error);
    } finally {
      this.currentTask = null;
      this.notifyListeners();
    }
  }

  getCurrentTask(): Task | null {
    return this.currentTask;
  }

  isRunning(): boolean {
    return this.currentTask !== null;
  }

  getTasks(): Task[] {
    return this.tasks;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  clearCompleted() {
    this.tasks = this.tasks.filter(task => task.status !== 'completed');
    this.notifyListeners();
  }

  clearAll() {
    this.tasks = [];
    this.currentTask = null;
    this.notifyListeners();
  }
}

export const taskManager = new TaskManager();
