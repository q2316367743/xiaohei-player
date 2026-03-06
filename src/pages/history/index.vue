<template>
  <app-tool-layout title="最近播放">
    <empty-result v-if="histories.length === 0" tip="暂无播放记录"/>
    <ol class="history-container">
      <li v-for="h in histories" :key="h.id" class="history-card" @click="handleClick(h)">
        <t-link theme="primary">
          <file-icon v-if="h.type === 'file'"/>
          <internet-icon v-else-if="h.type === 'url'"/>
          <span>「{{ prettyMessageDate(h.last_played_time) }}」</span>
          <span>{{ h.title }}</span>
        </t-link>
      </li>
    </ol>
  </app-tool-layout>
</template>
<script lang="ts" setup>
import type {HistoryEntity} from "@/entity/main/HistoryEntity.ts";
import {listHistory} from "@/service/HistoryService.ts";
import {prettyMessageDate} from "@/util/lang/FormatUtil.ts";
import {FileIcon, InternetIcon} from "tdesign-icons-vue-next";

const router = useRouter();

const histories = ref<Array<HistoryEntity>>([]);

const handleClick = (item: HistoryEntity) => {
  router.push({
    path: '/player/link',
    query: {
      type: item.type,
      src: item.path
    }
  });
}

onMounted(() => {
  listHistory().then(res => {
    histories.value = res;
  });
});
</script>
<style scoped lang="less">
.history-container {
}

</style>
