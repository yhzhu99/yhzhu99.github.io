<script setup lang="ts">
import { computed } from "vue";
import type { NewsItem } from "../types";

const props = defineProps<{
  items: NewsItem[];
  limit?: number;
}>();

const visibleItems = computed(() =>
  props.limit ? props.items.slice(0, props.limit) : props.items,
);
</script>

<template>
  <div class="space-y-1">
    <article v-for="item in visibleItems" :key="item.uid" class="unified-item">
      <div class="unified-item-content">
        <p class="text-xs text-text-gray" v-html="item.content" />
      </div>
      <span class="time-tag">{{ item.date }}</span>
    </article>
  </div>
</template>
