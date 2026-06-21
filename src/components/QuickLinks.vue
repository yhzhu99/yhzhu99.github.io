<script setup lang="ts">
import type { QuickLink } from "../types";

defineProps<{
  links: QuickLink[];
  icons: Record<string, string>;
}>();
</script>

<template>
  <div class="grid grid-cols-2 gap-1.5">
    <a
      v-for="link in links"
      :key="link.name"
      :href="link.url"
      target="_blank"
      rel="noopener noreferrer"
      class="interactive-element group flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-lg bg-slate-50 p-2.5 text-center text-xs transition-colors hover:bg-slate-100 hover:text-primary-blue"
    >
      <span
        class="quick-link-icon text-text-gray-light transition-colors group-hover:text-primary-blue"
        v-html="icons[link.name]"
      />
      <span>{{ link.name }}</span>
    </a>
  </div>
</template>
