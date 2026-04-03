<template>
  <div class="stream-list">
    <t-tabs v-model="active" class="mt-8px">
      <t-tab-panel v-for="item in list" :key="item.id" :value="item.id" :label="item.name" :destroy-on-hide="false">
        <stream-list-layout :stream-id="item.id"/>
      </t-tab-panel>
    </t-tabs>
  </div>
</template>
<script lang="ts" setup>

import type {NetworkServer} from "@/entity";
import {listNetworkServer} from "@/service";
import StreamListLayout from "@/pages/stream/list/components/StreamListLayout.vue";

const active = ref('');
const list = ref(new Array<NetworkServer>());


onMounted(async () => {
  list.value = await listNetworkServer();
  if (list.value.length > 0) {
    active.value = list.value[0]!.id;
  }
})
</script>
<style scoped lang="less">

</style>
