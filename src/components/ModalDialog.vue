<script setup lang="ts">
defineProps<{
  open: boolean;
  title: string;
}>();

defineEmits<{
  close: [];
}>();
</script>

<template>
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      @click.self="$emit('close')"
    >
      <Transition name="scale" appear>
        <section
          class="flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-surface shadow-card sm:max-h-[90dvh] sm:rounded-xl"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <header
            class="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 sm:p-4"
          >
            <h3 class="text-base font-bold text-text-gray sm:text-lg">
              {{ title }}
            </h3>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-gray-400 transition-colors hover:bg-slate-100 hover:text-gray-600"
              :aria-label="`Close ${title}`"
              @click="$emit('close')"
            >
              &times;
            </button>
          </header>
          <div
            class="scrollable-container min-h-0 flex-1 overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <slot />
          </div>
        </section>
      </Transition>
    </div>
  </Transition>
</template>
