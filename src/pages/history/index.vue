<template>
  <app-tool-layout title="最近播放">
    <empty-result v-if="histories.length === 0" tip="暂无播放记录"/>
    <ol class="history-container">
      <li v-for="h in histories" :key="h.id" class="history-card" @click="handleClick(h)">
        <div class="card-icon">
          <file-icon v-if="h.type === 'file'"/>
          <internet-icon v-else-if="h.type === 'url'"/>
        </div>
        <div class="card-content">
          <div class="card-title">{{ h.title }}</div>
          <div class="card-time">「{{ prettyMessageDate(h.last_played_time) }}」</div>
        </div>
      </li>
    </ol>
  </app-tool-layout>
</template>
<script lang="ts" setup>
import type {HistoryEntity} from "@/entity/main/HistoryEntity.ts";
import {listHistory} from "@/service/HistoryService.ts";
import {prettyMessageDate} from "@/util/lang/FormatUtil.ts";
import {FileIcon, InternetIcon} from "tdesign-icons-vue-next";

const router = useRouter();

const histories = ref<Array<HistoryEntity>>([]);

const handleClick = (item: HistoryEntity) => {
  router.push({
    path: '/player/link',
    query: {
      type: item.type,
      src: item.path
    }
  });
}

onMounted(() => {
  listHistory().then(res => {
    histories.value = res;
  });
});
</script>
<style scoped lang="less">
.history-container {
  padding: var(--td-size-4);
  display: flex;
  flex-direction: column;
  gap: var(--td-size-3);
  margin: 0;
}

.history-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--td-size-4);
  padding: var(--td-size-3) var(--td-size-4);
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
  box-shadow: 
    var(--td-shadow-2),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  border: 1px solid var(--td-border-level-1-color);
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.15) 0%,
      rgba(255, 255, 255, 0.05) 100%
    );
    pointer-events: none;
    border-radius: var(--td-radius-medium) var(--td-radius-medium) 0 0;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      var(--td-shadow-3),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
    border-color: var(--td-brand-color);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 
      var(--td-shadow-1),
      inset 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .card-icon {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--td-bg-color-component);
    border-radius: var(--td-radius-medium);
    box-shadow: 
      inset 0 1px 0 rgba(255, 255, 255, 0.4),
      0 1px 2px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--td-border-level-2-color);
    position: relative;
    z-index: 1;

    .t-icon {
      color: var(--td-brand-color);
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
    }
  }

  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--td-size-2);
    min-width: 0;
    position: relative;
    z-index: 1;

    .card-title {
      font: var(--td-font-body-medium);
      color: var(--td-text-color-primary);
      text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-time {
      font: var(--td-font-body-small);
      color: var(--td-text-color-secondary);
      text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
    }
  }
}

:root[theme-mode="dark"] .history-card {
  &::before {
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(255, 255, 255, 0.02) 100%
    );
  }

  :deep(.t-link) {
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);

    span:first-of-type {
      box-shadow: 
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        0 1px 2px rgba(0, 0, 0, 0.3);
    }

    span:last-of-type {
      text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
    }
  }
}
</style>
