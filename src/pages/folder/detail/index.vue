<template>
  <FolderDetail v-if="adapter" :adapter="adapter" />
  <loading-result v-else tip="加载中"/>
</template>
<script lang="ts" setup>
import {getFolder} from "@/service";
import {createFileAdapter, type FileBrowser} from "@/module/file";
import MessageUtil from "@/util/model/MessageUtil.ts";
import FolderDetail from "@/pages/folder/detail/FolderDetail.vue";

const route = useRoute();
const router = useRouter();

const folderId = route.params.id as string;

const adapter = ref<FileBrowser>()

onMounted(async () => {
  const folder = await getFolder(folderId);
  if (!folder) {
    MessageUtil.error('未找到该文件');
    router.back();
    return;
  }
  adapter.value = createFileAdapter(folder);
})
</script>
<style scoped lang="less">

</style>
