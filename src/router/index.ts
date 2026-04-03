import {createRouter, createWebHashHistory} from 'vue-router';
// 引入路由

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      name: "首页",
      path: '/',
      component: () => import('@/pages/home/index.vue'),
    },
    {
      name: "FolderList",
      path: '/folder/list',
      component: () => import('@/pages/folder/list/FolderList.vue'),
    },
    {
      name: "FolderDetail",
      path: '/folder/detail/:id',
      component: () => import('@/pages/folder/detail/index.vue'),
    },
    {
      name: "LibraryList",
      path: '/library/list',
      component: () => import('@/pages/library/list/index.vue'),
    },
    {
      name: "LibraryDetail",
      path: '/library/detail/:id',
      component: () => import('@/pages/library/detail/index.vue'),
    },
    {
      name: "LibraryActor",
      path: '/library/actor/:id',
      component: () => import('@/pages/library/actor/actor.vue'),
    },
    {
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
    },
    {
      name: "PlayerLibrary",
      path: '/player/library/:id',
      component: () => import('@/pages/player/library/index.vue'),
    },
    {
      name: "PlayerLink",
      path: '/player/link',
      component: () => import('@/pages/player/link/index.vue'),
    },
    {
      name: "PlayerFolder",
      path: '/player/folder',
      component: () => import('@/pages/player/folder/index.vue'),
    }
  ]
});

