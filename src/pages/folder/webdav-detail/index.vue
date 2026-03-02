<template>
  <div v-if="local">本地文件</div>
  <loading-result v-else tip="加载中"/>
</template>
<script lang="ts" setup>
import type {FolderLocal} from "@/entity/domain/FolderLocal.ts";
import {getFolderLocal} from "@/service";

const route = useRoute();

const folderId = route.params.id as string;

const local = ref<FolderLocal>()

onMounted(async () => {
  local.value = await getFolderLocal(folderId);
})
</script>
<style scoped lang="less">

</style>
