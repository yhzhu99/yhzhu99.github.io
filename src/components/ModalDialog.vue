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
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <Transition name="scale" appear>
        <section
          class="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-card"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <header class="flex items-center justify-between border-b p-4">
            <h3 class="text-lg font-bold text-text-gray">{{ title }}</h3>
            <button
              type="button"
              class="text-2xl leading-none text-gray-400 transition-colors hover:text-gray-600"
              :aria-label="`Close ${title}`"
              @click="$emit('close')"
            >
              &times;
            </button>
          </header>
          <div class="scrollable-container min-h-0 flex-1 overflow-y-auto p-4">
            <slot />
          </div>
        </section>
      </Transition>
    </div>
  </Transition>
</template>
