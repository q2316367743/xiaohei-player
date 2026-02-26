import {Store} from "@tauri-apps/plugin-store";
import {APP_DATA_STORE_PATH} from "@/global/Constants";
import {cloneDeep} from "es-toolkit";
import type {UnlistenFn} from "@tauri-apps/api/event";
import {getTaskSetting, type TaskSetting} from "@/entity/setting/TaskSetting.ts";
import {getLibrarySetting, type LibrarySetting} from "@/entity/setting/LibrarySetting.ts";
import {getSystemSetting, type SystemSetting} from "@/entity/setting/SystemSetting.ts";


class StoreWrapper {

  private readonly storeName: string
  private store: Store | null = null;

  constructor(storeName: string) {
    this.storeName = storeName;
  }

  private promiseChain: Promise<unknown> = Promise.resolve();

  async getStore(): Promise<Store> {
    // 将新的 SQL 调用追加到 Promise 链尾部
    this.promiseChain = this.promiseChain
      .then(() => this._getStore())
      .catch((err) => {
        console.error('get store error:', err);
        // 失败也继续
      });

    return this.promiseChain as Promise<Store>;
  }

  private async _getStore() {
    if (!this.store) {
      this.store = await Store.load(await APP_DATA_STORE_PATH(this.storeName));
    }
    return this.store;
  }

  async get<T = any>(key: string) {
    const store = await this.getStore();
    return store.get<T>(key);
  }

  async set<T>(key: string, value: T) {
    const store = await this.getStore();
    await store.set(key, cloneDeep(value));
    await store.save();
  }

  async delete(key: string) {
    const store = await this.getStore();
    return store.delete(key);
  }

  async list<T = any>(key: string) {
    const res = await this.get<Array<T>>(key);
    return res || [];
  }

  async save<T = any>(key: string, value: Array<T>) {
    await this.set(key, value);
  }


  async entries<T>(): Promise<Array<[key: string, value: T]>> {
    const store = await this.getStore();
    return store.entries<T>();
  }

  async onChange<T>(cb: (key: string, value: T | undefined) => void): Promise<UnlistenFn> {
    const store = await this.getStore();
    return store.onChange(cb);
  }
}

export class StoreEntry<T extends Record<string, any> = Record<string, any>> {
  private readonly store: StoreWrapper;
  private readonly defaultValue: T;

  constructor(storeName: string, defaultValue: T) {
    this.store = new StoreWrapper(storeName);
    this.defaultValue = defaultValue;
  }

  private getStore() {
    return this.store.getStore();
  }

  async get(): Promise<T> {
    const store = await this.getStore();
    const entries = await store.entries<any>();
    const r: Record<string, any> = {};

    const target = entries.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, any>);

    const deepMerge = (target: any, source: any): any => {
      if (typeof source !== 'object' || source === null || Array.isArray(source)) {
        return source;
      }
      if (typeof target !== 'object' || target === null || Array.isArray(target)) {
        return source;
      }
      const result = { ...target };
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          result[key] = deepMerge(result[key], source[key]);
        }
      }
      return result;
    };

    Object.entries(this.defaultValue).forEach(([key, value]) => {
      const v = target[key] as any;
      if (typeof v === 'undefined' || v === null) {
        r[key] = value;
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        r[key] = deepMerge(v, value);
      } else {
        r[key] = v;
      }
    });
    return r as T;
  }

  async set(data: T) {
    const store = await this.getStore();
    for (const [key, value] of Object.entries(data)) {
      await store.set(key, value);
    }
    await store.save();
  }

  async setItem<K extends keyof T>(key: K, value: T[K]) {
    const store = await this.getStore();
    await store.set(key as string, value);
    await store.save();
  }

  async getItem<K extends keyof T>(key: K): Promise<T[K]> {
    const store = await this.getStore();
    const v = await store.get<T[K]>(key as string);
    if (typeof v === 'undefined' || v === null) {
      return this.defaultValue[key];
    }
    return v;
  }
}

const taskSettingStore = new StoreEntry<TaskSetting>("task", getTaskSetting());
const librarySettingStore = new StoreEntry<LibrarySetting>("task", getLibrarySetting());
const systemSettingStore = new StoreEntry<SystemSetting>("task", getSystemSetting());

// 任务设置
export const useTaskSettingStore = () => taskSettingStore;
// 收藏库设置
export const useLibrarySettingStore = () => librarySettingStore;
// 系统设置
export const useSystemSettingStore = () => systemSettingStore;
