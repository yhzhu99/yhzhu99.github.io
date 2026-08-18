<script setup lang="ts">
import { useTheme } from "../composables/useTheme";

const { isDark, toggleTheme } = useTheme();
</script>

<template>
  <button
    type="button"
    class="interactive-element inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-surface/70 text-text-gray-light shadow-soft backdrop-blur-md transition-colors hover:border-primary-blue/40 hover:bg-primary-blue/5 hover:text-primary-blue"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :aria-pressed="isDark"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggleTheme"
  >
    <svg
      v-if="isDark"
      class="h-4.5 w-4.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
      />
    </svg>
    <svg
      v-else
      class="h-4.5 w-4.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  </button>
</template>
