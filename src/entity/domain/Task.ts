import type {BaseEntity} from "@/entity/BaseEntity.ts";

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Task extends BaseEntity {
  name: string;
  status: TaskStatus;
  progress: number;
  total: number;
  message: string;
  logs: string[];
}
