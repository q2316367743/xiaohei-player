<template>
  <div class="flex gap-8px w-full">
    <t-input v-model="data" class="w-full" :placeholder/>
    <t-button variant="outline" theme="primary" @click="handleSelect">选择文件</t-button>
  </div>
</template>
<script lang="ts" setup>
import {open} from '@tauri-apps/plugin-dialog';
interface DialogFilter {
  /** Filter name. */
  name: string;
  /**
   * Extensions to filter, without a `.` prefix.
   * @example
   * ```typescript
   * extensions: ['svg', 'png']
   * ```
   */
  extensions: string[];
}

const data = defineModel({
  type: String,
  default: ''
});

const props = defineProps({
  placeholder: String,
  title: String,
  filters: Array as PropType<Array<DialogFilter>>,
  defaultPath: String,
  directory: Boolean,
  recursive: Boolean,
  canCreateDirectories: Boolean
});

const handleSelect = () => {
  open({
    ...props,
    multiple: false
  }).then((result) => {
    data.value = result || '';
  })
}
</script>
<style scoped lang="less">

</style>
