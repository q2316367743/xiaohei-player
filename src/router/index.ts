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
    }
  ]
});

