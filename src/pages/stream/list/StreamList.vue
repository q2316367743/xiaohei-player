<template>
  <div class="stream-list">
    <t-tabs v-model="active" class="mt-8px">
      <t-tab-panel v-for="item in list" :key="item.id" :value="item.id" :label="item.name">
        <stream-list-layout :stream-id="item.id"/>
      </t-tab-panel>
    </t-tabs>
  </div>
</template>
<script lang="ts" setup>
import StreamListLayout from "@/pages/stream/list/components/StreamListLayout.vue";
import {LocalName} from "@/global/LocalName.ts";
import {useStreamStore} from "@/store";

defineOptions({
  name: 'StreamList',
})

const active = useLocalStorage(LocalName.PAGE_STREAM_ACTIVE, '');
const list = computed(() => useStreamStore().streamServers);

</script>
<style scoped lang="less">

</style>
