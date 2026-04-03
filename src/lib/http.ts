import axios, {type AxiosRequestConfig} from "axios";
import {isTauri} from "@tauri-apps/api/core";
import {type ClientOptions, fetch} from '@tauri-apps/plugin-http'
import {useSettingStore} from "@/store";

function getTauriFetch() {
  return isTauri() ? async (input: URL | Request | string, init?: RequestInit) => {
    const c: RequestInit & ClientOptions = init || {};
    const {systemSetting} = useSettingStore();
    if (systemSetting.proxy_enabled) {
      c.proxy = {
        all: {
          url: `${systemSetting.proxy_protocol}://${systemSetting.proxy_host}:${systemSetting.proxy_port}`,
          basicAuth: {
            username: systemSetting.proxy_username,
            password: systemSetting.proxy_password
          }
        }
      }
    }
    return fetch(input, init);
  } : undefined;
}

export type Method =
  | 'get' | 'GET'
  | 'delete' | 'DELETE'
  | 'head' | 'HEAD'
  | 'options' | 'OPTIONS'
  | 'post' | 'POST'
  | 'put' | 'PUT'
  | 'patch' | 'PATCH'
  | 'purge' | 'PURGE'
  | 'link' | 'LINK'
  | 'unlink' | 'UNLINK';

export const instance = axios.create({
  timeout: 150000,
  adapter: 'fetch',
  env: {
    fetch: getTauriFetch()
  }
  // 配置代理等信息
});

instance.interceptors.request.use(c => {
  if (isTauri()) console.debug(c)
  return c;
})

instance.interceptors.response.use(e => {
  if (isTauri()) console.debug(e);
  return e;
}, e => {
  if (isTauri()) console.error(e);
  return Promise.reject(e);
})

export interface RequestConfig extends AxiosRequestConfig {
  webview?: boolean
}

export function requestAction<T = Record<string, any>>(config: RequestConfig) {
  return instance.request<T>(config);
}

export function getAction<T = Record<string, any>>(url: string, params?: Record<string, any>, config?: RequestConfig) {
  return instance.get<T>(url, {
    ...config,
    params
  });
}

export function postAction<T = Record<string, any>>(url: string, data?: Record<string, any>, config?: RequestConfig) {
  return instance.post<T>(url, data, config);
}

export async function getTextAction(url: string, config?: RequestConfig): Promise<string> {
  const {data} = await instance.get<string>(url, {
    ...config,
    responseType: 'text'
  })
  return data;
}