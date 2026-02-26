import {Store} from "@tauri-apps/plugin-store";
import {APP_DATA_STORE_PATH} from "@/global/Constants";
import {cloneDeep} from "es-toolkit";
import type {UnlistenFn} from "@tauri-apps/api/event";


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
      .finally(() => this._getStore())
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

const instance = new StoreWrapper("path");

export const usePathStore = () => instance;
