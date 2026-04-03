<template>
  <t-layout>
    <t-aside></t-aside>
    <t-content>
      <t-loading :loading="loading" text="Loading..."/>
    </t-content>
  </t-layout>
</template>
<script lang="ts" setup>
import type {INetworkServer} from "@/module/network/INetworkServer.ts";
import {getNetworkServerClient} from "@/service";
import type {NetworkCategory} from "@/module/network/types/NetworkCategory.ts";
import type {NetworkListItem} from "@/module/network/types/NetworkListItem.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";

const props = defineProps({
  streamId: {
    type: String,
    required: true
  }
});
const client = shallowRef<INetworkServer>();
const categories = ref(new Array<NetworkCategory>());

const loading = ref(false);
const page = ref(0);
const total = ref(0);
const list = ref(new Array<NetworkListItem>());

const nextPage = async () => {
  if (loading.value) return;
  loading.value = true;
  page.value += 1;
  try {
    const res = await client.value?.getVideos('', page.value);
    if (res) {
      list.value = [...list.value, ...res.data];
      total.value = res.total;
    }
  } catch (e) {
    MessageUtil.error('加载数据失败', e);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  try {
    client.value = await getNetworkServerClient(props.streamId);
    if (client.value) {
      const [res1] = await Promise.all([
        client.value.home(1),
        nextPage()
      ]);
      categories.value = res1.categories;
    }
  } catch (e) {
    MessageUtil.error("初始化数据失败", e);
  }
})
</script>
<style scoped lang="less">

</style>
