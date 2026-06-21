<script setup lang="ts">
import { computed } from "vue";
import type { NewsItem } from "../types";

const props = defineProps<{
  items: NewsItem[];
  limit?: number;
  modal?: boolean;
}>();

const visibleItems = computed(() =>
  props.limit ? props.items.slice(0, props.limit) : props.items,
);
</script>

<template>
  <div class="unified-list">
    <article
      v-for="item in visibleItems"
      :key="item.uid"
      :class="modal ? 'modal-unified-item' : 'unified-item'"
    >
      <div
        :class="modal ? 'modal-unified-item-content' : 'unified-item-content'"
      >
        <p
          :class="
            modal
              ? 'text-sm leading-relaxed text-text-gray'
              : 'text-xs text-text-gray'
          "
          v-html="item.content"
        />
      </div>
      <span class="time-tag">{{ item.date }}</span>
    </article>
  </div>
</template>
