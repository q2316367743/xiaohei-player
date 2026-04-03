import {type RouteRecordRaw} from "vue-router";

export const streamRouter: RouteRecordRaw = {
  name: 'Stream',
  path: '/stream',
  component: () => import('@/pages/stream/index.vue'),
  children: [{
    name: 'StreamList',
    path: 'list',
    component: () => import('@/pages/stream/list/StreamList.vue'),
  }, {
    name: 'StreamSearch',
    path: 'search',
    component: () => import('@/pages/stream/search/StreamSearch.vue'),
  }]
}