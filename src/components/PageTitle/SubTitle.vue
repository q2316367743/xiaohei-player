<template>
  <div class="my-8px">
    <t-tabs default-value="1">
      <t-tab-panel :label="title" value="1" />
      <template #action>
        <slot name="action" />
      </template>
    </t-tabs>
  </div>
</template>
<script lang="ts" setup>
defineProps({
  title: String
});
</script>
<style scoped lang="less">

</style>
