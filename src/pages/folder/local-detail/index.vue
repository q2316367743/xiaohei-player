<template>
  <FolderDetail v-if="adapter" :adapter="adapter" />
  <loading-result v-else tip="加载中"/>
</template>
<script lang="ts" setup>
import {getFolderLocal} from "@/service";
import {createFileAdapter, type FileBrowser} from "@/module/file";
import MessageUtil from "@/util/model/MessageUtil.ts";
import FolderDetail from "@/pages/folder/detail/FolderDetail.vue";

const route = useRoute();
const router = useRouter();

const folderId = route.params.id as string;

const adapter = ref<FileBrowser>()

onMounted(async () => {
  const local = await getFolderLocal(folderId);
  if (!local) {
    MessageUtil.error('未找到该文件');
    router.back();
    return;
  }
  adapter.value = createFileAdapter('local', local);
})
</script>
<style scoped lang="less">

</style>
