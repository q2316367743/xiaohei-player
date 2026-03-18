<template>
  <FolderDetail v-if="adapter" :adapter="adapter" :folder-id="folderId"/>
  <loading-result v-else tip="加载中"/>
</template>
<script lang="ts" setup>
import {createFileBrowser} from "@/service";
import {type FileBrowser} from "@/module/file";
import MessageUtil from "@/util/model/MessageUtil.ts";
import FolderDetail from "@/pages/folder/detail/FolderDetail.vue";

defineOptions({
  name: 'FolderDetail'
});

const route = useRoute();
const router = useRouter();

const folderId = computed(() => route.params.id as string);

const adapter = ref<FileBrowser>()

onMounted(async () => {
  const temp = await createFileBrowser(folderId.value);
  if (!temp) {
    MessageUtil.error('未找到该文件');
    router.back();
    return;
  }
  adapter.value = temp;
})
</script>
<style scoped lang="less">

</style>
