import {Store} from '@tauri-apps/plugin-store';
// 当设置 `"withGlobalTauri": true` 时，你可以用
// const { Client, Stronghold } = window.__TAURI__.stronghold;
import {APP_DATA_VAULT_PATH, APP_PASSWORD} from "@/global/Constants.ts";
import {useMediaServerStore} from "@/store";
// 当设置 `"withGlobalTauri": true` 时，你可以用
// const { appDataDir } = window.__TAURI__.path;

// 加密工具类
class CryptoUtil {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12; // GCM 推荐的 IV 长度

  // 加密数据
  static async encrypt(data: string, password: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      // 生成随机的 IV 和 salt
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      const salt = crypto.getRandomValues(new Uint8Array(16));

      // 使用固定的 salt 生成密钥
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        {name: 'PBKDF2'},
        false,
        ['deriveKey']
      );

      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        {
          name: this.ALGORITHM,
          length: this.KEY_LENGTH
        },
        false,
        ['encrypt', 'decrypt']
      );

      // 加密数据
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        key,
        dataBuffer
      );

      // 组合 salt、IV 和加密数据，并进行 Base64 编码
      const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('加密失败:', error);
      throw new Error('数据加密失败');
    }
  }

  // 解密数据
  static async decrypt(encryptedData: string, password: string): Promise<string> {
    try {
      // Base64 解码
      const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

      // 分离 salt、IV 和加密数据
      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 16 + this.IV_LENGTH);
      const encrypted = combined.slice(16 + this.IV_LENGTH);

      // 使用提取的 salt 生成密钥
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        {name: 'PBKDF2'},
        false,
        ['deriveKey']
      );

      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        {
          name: this.ALGORITHM,
          length: this.KEY_LENGTH
        },
        false,
        ['encrypt', 'decrypt']
      );

      // 解密数据
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('解密失败:', error);
      throw new Error('数据解密失败');
    }
  }
}


class StrongholdWrapper {
  private store: Store | null = null;
  private readonly vaultName: string;

  constructor(vaultName: string) {
    this.vaultName = vaultName;
  }

  private async getStore() {
    if (!this.store) {
      this.store = await Store.load(await APP_DATA_VAULT_PATH(this.vaultName));
    }
    return this.store;
  }


  /**
   * 插入一条记录（加密存储）
   * @param key 键
   * @param value 值
   * @param timeout 超时时间，默认0，不超时
   */
  async insertRecord(key: string, value: string, timeout = 0) {
    const store = await this.getStore();

    try {
      // 加密值
      const encryptedValue = await CryptoUtil.encrypt(value, APP_PASSWORD);

      // 存储加密后的数据
      await store.set(key, JSON.stringify({
        timeout,
        value: encryptedValue,
        start: Date.now(),
        encrypted: true // 标记数据已加密
      }));
    } catch (error) {
      console.error(`插入记录失败 [${key}]:`, error);
      throw new Error(`无法安全存储数据: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async getRecord(key: string): Promise<string | null> {
    const store = await this.getStore();
    const data = await store.get<string>(key);
    if (!data) return null;

    try {
      const obj = JSON.parse(data);

      // 检查超时
      if (obj.timeout > 0 && Date.now() - obj.start > obj.timeout) {
        await store.delete(key);
        return null;
      }

      // 如果数据已加密，进行解密
      if (obj.encrypted) {
        try {
          return await CryptoUtil.decrypt(obj.value, APP_PASSWORD);
        } catch (decryptError) {
          console.error(`解密失败 [${key}]:`, decryptError);
          // 如果解密失败，可能是密钥不匹配，返回 null
          return null;
        }
      }

      // 兼容旧版本未加密的数据
      return obj.value;
    } catch (error) {
      console.error(`获取记录失败 [${key}]:`, error);
      return null;
    }
  }

  async removeRecord(key: string) {
    const store = await this.getStore();
    await store.delete(key);
  }

  async onChange<T = string>(cb: (key: string, value: T | undefined) => void) {
    const store = await this.getStore();
    return store.onChange(cb);
  }

}

class StrongholdMediaWrapper extends StrongholdWrapper {

  async getMediaRecord(serviceId: string, key: string) {
    return await this.getRecord(`/media/${serviceId}/${key}`);
  }

  async setMediaRecord(serviceId: string, key: string, value: string, timeout?: number) {
    await this.insertRecord(`/media/${serviceId}/${key}`, value, timeout);
  }

  async removeMediaRecord(serviceId: string, key: string) {
    await this.removeRecord(`/media/${serviceId}/${key}`);
  }

}

class StrongholdFileWrapper extends StrongholdWrapper {

  async getFileRecord(serviceId: string, key: string) {
    return await this.getRecord(`/file/${serviceId}/${key}`);
  }

  async setFileRecord(serviceId: string, key: string, value: string, timeout?: number) {
    await this.insertRecord(`/file/${serviceId}/${key}`, value, timeout);
  }

  async removeFileRecord(serviceId: string, key: string) {
    await this.removeRecord(`/file/${serviceId}/${key}`);
  }

}

const strongholdWrapper = new StrongholdWrapper("vault");

export const useStronghold = () => {
  return strongholdWrapper;
}

const mediaStrongholdWrap = new StrongholdMediaWrapper("media");

mediaStrongholdWrap.onChange((key) => {
  const serviceId = key.split("/")[2];
  if (!serviceId) return;
  useMediaServerStore().removeServerClient(serviceId);
}).then(() => console.debug("媒体密钥监听"))

// 媒体专用
export const useMediaStronghold = () => {
  return mediaStrongholdWrap;
}

const fileStrongholdWrap = new StrongholdFileWrapper("file");

// 文件专用
export const useFileStronghold = () => {
  return fileStrongholdWrap;
}