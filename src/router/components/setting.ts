import {type RouteRecordRaw} from "vue-router";

export const settingRouter: RouteRecordRaw = {
  name: "Setting",
  path: '/setting',
  component: () => import('@/pages/setting/Setting.vue'),
  children: [{
    name: 'SettingTask',
    path: 'task',
    component: () => import('@/pages/setting/task/SettingTask.vue'),
  }, {
    name: 'SettingLibrary',
    path: 'library',
    component: () => import('@/pages/setting/library/SettingLibrary.vue'),
  }, {
    name: "SettingNetwork",
    path: 'network',
    component: () => import('@/pages/setting/stream/SettingStream.vue'),
  }, {
    name: 'SettingInterface',
    path: 'interface',
    component: () => import('@/pages/setting/interface/index.vue'),
  }, {
    name: "SettingSystem",
    path: 'system',
    component: () => import('@/pages/setting/system/SettingSystem.vue'),
  }, {
    name: "SettingLog",
    path: 'log',
    component: () => import('@/pages/setting/log/index.vue'),
  }, {
    name: "SettingAbout",
    path: 'about',
    component: () => import('@/pages/setting/about/index.vue'),
  }]
};