<script setup lang="ts">
import type { TimelineItem } from "../types";

defineProps<{
  title: string;
  items: TimelineItem[];
  kind: "education" | "experience";
}>();
</script>

<template>
  <section>
    <h3
      class="section-title mb-3 text-lg font-semibold tracking-tight text-text-gray"
    >
      {{ title }}
    </h3>
    <div
      class="relative space-y-3 border-l-2 pl-5"
      :class="
        kind === 'education'
          ? 'border-primary-blue/30'
          : 'border-accent-gray/30'
      "
    >
      <article
        v-for="item in items"
        :key="item.uid"
        class="timeline-item"
        :class="
          kind === 'education' ? 'timeline-item-blue' : 'timeline-item-gray'
        "
      >
        <div
          class="rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300"
        >
          <div class="mb-2 flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <h4 class="text-sm font-semibold text-text-gray">
                {{
                  kind === "education" ? item.institution : item.organization
                }}
              </h4>
              <p class="text-xs text-primary-blue">
                {{ kind === "education" ? item.degree : item.position }}
              </p>
              <p class="text-xs text-text-gray-light">
                {{ item.location }}
              </p>
            </div>
            <span class="time-tag">{{ item.period }}</span>
          </div>
          <p
            v-if="item.details"
            class="text-xs text-text-gray-light"
            v-html="item.details"
          />
        </div>
      </article>
    </div>
  </section>
</template>
