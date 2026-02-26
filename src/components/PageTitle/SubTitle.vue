<template>
  <div class="mb-8px">
    <t-tabs default-value="1">
      <t-tab-panel :label="title" value="1" />
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
