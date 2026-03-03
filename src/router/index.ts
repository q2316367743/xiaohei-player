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
      name: "History",
      path: '/history',
      component: () => import('@/pages/history/index.vue'),
    },
    {
      name: "FolderList",
      path: '/folder/list/:type',
      component: () => import('@/pages/folder/list/index.vue'),
    },
    {
      name: "FolderDetail",
      path: '/folder/detail/:id',
      component: () => import('@/pages/folder/detail/index.vue'),
    },
    {
      name: "Library",
      path: '/library',
      component: () => import('@/pages/library/index.vue'),
      children: [
        {
          name: "LibraryScene",
          path: 'scene',
          component: () => import('@/pages/library/scene/index.vue'),
        },
        {
          name: "演员",
          path: 'actor',
          component: () => import('@/pages/library/actor/index.vue'),
        },
        {
          name: "标签",
          path: 'tag',
          component: () => import('@/pages/library/tag/index.vue'),
        },
        {
          name: "工作室",
          path: 'studio',
          component: () => import('@/pages/library/studio/index.vue'),
        }
      ]
    },
    {
      name: "Setting",
      path: '/setting',
      component: () => import('@/pages/setting/index.vue'),
      children: [
        {
          name: "SettingTask",
          path: 'task',
          component: () => import('@/pages/setting/task/SettingTask.vue'),
        },
        {
          name: "SettingLibrary",
          path: 'library',
          component: () => import('@/pages/setting/library/SettingLibrary.vue'),
        },
        {
          name: "SettingInterface",
          path: 'interface',
          component: () => import('@/pages/setting/interface/index.vue'),
        },
        {
          name: "SettingMetadata",
          path: 'metadata',
          component: () => import('@/pages/setting/metadata/index.vue'),
        },
        {
          name: "SettingSystem",
          path: 'system',
          component: () => import('@/pages/setting/system/SettingSystem.vue'),
        },
        {
          name: "SettingPlugin",
          path: 'plugin',
          component: () => import('@/pages/setting/plugin/index.vue'),
        },
        {
          name: "SettingLog",
          path: 'log',
          component: () => import('@/pages/setting/log/index.vue'),
        },
        {
          name: "SettingAbout",
          path: 'about',
          component: () => import('@/pages/setting/about/index.vue'),
        }
      ]
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
    }
  ]
});

