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
      name: "最近播放",
      path: '/history',
      component: () => import('@/pages/history/index.vue'),
    },
    {
      name: "文件",
      path: '/file',
      component: () => import('@/pages/file/index.vue'),
      children: [
        {
          name: "WebDAV",
          path: 'webdav',
          component: () => import('@/pages/file/webdav/index.vue'),
        },
        {
          name: "本地文件",
          path: 'local',
          component: () => import('@/pages/file/local/index.vue'),
        },
      ]
    },
    {
      name: "片库",
      path: '/library',
      component: () => import('@/pages/library/index.vue'),
      children: [
        {
          name: "电影",
          path: 'scene',
          component: () => import('@/pages/library/scene/index.vue'),
        }
      ]
    },
    {
      name: "设置",
      path: '/setting',
      component: () => import('@/pages/setting/index.vue'),
      children: [
        {
          name: "任务",
          path: 'task',
          component: () => import('@/pages/setting/task/SettingTask.vue'),
        },
        {
          name: "收藏库",
          path: 'library',
          component: () => import('@/pages/setting/library/SettingLibrary.vue'),
        },
        {
          name: "界面",
          path: 'interface',
          component: () => import('@/pages/setting/interface/index.vue'),
        },
        {
          name: "元数据提供者",
          path: 'metadata',
          component: () => import('@/pages/setting/metadata/index.vue'),
        },
        {
          name: "系统",
          path: 'system',
          component: () => import('@/pages/setting/system/SettingSystem.vue'),
        },
        {
          name: "插件",
          path: 'plugin',
          component: () => import('@/pages/setting/plugin/index.vue'),
        },
        {
          name: "日志",
          path: 'log',
          component: () => import('@/pages/setting/log/index.vue'),
        },
        {
          name: "关于",
          path: 'about',
          component: () => import('@/pages/setting/about/index.vue'),
        }
      ]
    }
  ]
});

