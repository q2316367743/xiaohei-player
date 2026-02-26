import {Store} from "@tauri-apps/plugin-store";
import {APP_DATA_STORE_PATH} from "@/global/Constants";
import {cloneDeep} from "es-toolkit";
import type {UnlistenFn} from "@tauri-apps/api/event";
import type {TaskSetting} from "@/entity/setting/TaskSetting.ts";


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

export class StoreEntry<T extends Record<string, any>>
{
  private store: StoreWrapper;

  constructor(storeName: string) {
    this.store = new StoreWrapper(storeName);
  }

  private getStore() {
    return this.store.getStore();
  }

  async get(): Promise<T> {
    const store = await this.getStore();
    const entries = await store.entries<any>();
    return entries.reduce((acc, [key, value]) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      acc[key] = value;
      return acc;
    }, {} as T);
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
}

const instance = new StoreEntry<TaskSetting>("task");

// 任务设置
export const useTaskSettingStore = () => instance;
