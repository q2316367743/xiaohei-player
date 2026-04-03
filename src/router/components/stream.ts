import {type RouteRecordRaw} from "vue-router";

export const streamRouters: Array<RouteRecordRaw> = [{
  name: 'StreamList',
  path: '/stream/list',
  component: () => import('@/pages/stream/list/StreamList.vue'),
}, {
  name: 'StreamSearch',
  path: '/stream/search',
  component: () => import('@/pages/stream/search/StreamSearch.vue'),
}];