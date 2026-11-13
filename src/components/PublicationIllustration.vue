<script setup lang="ts">
import { computed } from "vue";
import { publicationIllustrations } from "../data/publication-illustrations";

const props = defineProps<{ name: string }>();
const illustration = computed(() => publicationIllustrations[props.name]);
</script>

<template>
  <svg
    v-if="illustration"
    class="publication-illustration"
    viewBox="0 0 300 174"
    role="img"
    :aria-label="`${illustration.title}: ${illustration.nodes.join(' to ')}. ${illustration.subtitle}`"
    :style="{ '--illustration-accent': illustration.accent }"
  >
    <rect width="300" height="174" rx="10" fill="#f5f8fc" />
    <circle
      cx="275"
      cy="13"
      r="45"
      fill="var(--illustration-accent)"
      opacity="0.06"
    />
    <text x="16" y="25" class="illustration-title">
      {{ illustration.title }}
    </text>
    <text x="16" y="44" class="illustration-subtitle">
      {{ illustration.subtitle }}
    </text>
    <path d="M93 90H107 M193 90H207" class="illustration-path" />
    <path d="M103 86l5 4-5 4 M203 86l5 4-5 4" class="illustration-arrow" />
    <circle
      class="illustration-pulse illustration-pulse-one"
      cx="94"
      cy="90"
      r="3"
    />
    <circle
      class="illustration-pulse illustration-pulse-two"
      cx="194"
      cy="90"
      r="3"
    />
    <g
      v-for="(node, index) in illustration.nodes"
      :key="node"
      :transform="`translate(${8 + index * 100} 60)`"
    >
      <rect
        width="85"
        height="61"
        rx="12"
        fill="white"
        stroke="var(--illustration-accent)"
        stroke-opacity="0.2"
      />
      <g transform="translate(30 9)" class="illustration-icon">
        <template v-if="illustration.icons[index] === 'record'">
          <rect x="4" y="2" width="18" height="23" rx="3" />
          <path d="M9 9h8M9 14h8M9 19h5" />
        </template>
        <template v-else-if="illustration.icons[index] === 'chart'">
          <path d="M3 3v21h22M6 19l5-6 4 3 7-9" />
          <circle cx="22" cy="7" r="2" />
        </template>
        <template v-else-if="illustration.icons[index] === 'person'">
          <circle cx="13" cy="8" r="5" />
          <path d="M4 24c0-5 4-8 9-8s9 3 9 8" />
        </template>
        <template v-else-if="illustration.icons[index] === 'loop'">
          <path
            d="M5 12a9 9 0 0 1 16-4l2 2M23 3v7h-7M21 15A9 9 0 0 1 5 19l-2-2M3 24v-7h7"
          />
        </template>
        <template v-else-if="illustration.icons[index] === 'report'">
          <rect x="4" y="2" width="18" height="23" rx="3" />
          <path d="M8 9h10M8 14h10M8 19h6" />
        </template>
        <template v-else-if="illustration.icons[index] === 'heart'">
          <path
            d="M13 24S3 18 3 10c0-6 7-8 10-2 3-6 10-4 10 2 0 8-10 14-10 14Z"
          />
        </template>
        <template v-else-if="illustration.icons[index] === 'medical'">
          <rect x="3" y="3" width="20" height="20" rx="5" />
          <path d="M13 7v12M7 13h12" />
        </template>
        <template v-else-if="illustration.icons[index] === 'group'">
          <circle cx="13" cy="8" r="4" />
          <circle cx="4" cy="12" r="2.5" />
          <circle cx="22" cy="12" r="2.5" />
          <path
            d="M7 23c0-4 2-7 6-7s6 3 6 7M0 23c0-3 2-5 5-5M26 23c0-3-2-5-5-5"
          />
        </template>
        <template v-else-if="illustration.icons[index] === 'search'">
          <circle cx="11" cy="11" r="8" />
          <path d="m17 17 7 7" />
        </template>
        <template v-else-if="illustration.icons[index] === 'warning'">
          <path d="M13 3 25 23H1L13 3Z M13 10v6M13 19v1" />
        </template>
        <template v-else>
          <rect x="2" y="3" width="9" height="20" rx="3" />
          <rect x="15" y="3" width="9" height="20" rx="3" />
          <path d="M5 9h3M18 9h3M5 15h3M18 15h3" />
        </template>
      </g>
      <text x="42.5" y="52" text-anchor="middle" class="illustration-node">
        {{ node }}
      </text>
    </g>
    <path
      v-if="name === 'healthflow'"
      d="M245 132v6H55v-6"
      class="illustration-return"
    />
    <text
      v-if="name === 'healthflow'"
      x="150"
      y="156"
      text-anchor="middle"
      class="illustration-memory"
    >
      Governed experience memory
    </text>
  </svg>
</template>

<style scoped>
.publication-illustration {
  display: block;
  width: 100%;
  height: 100%;
}
.illustration-title {
  font:
    700 16px system-ui,
    sans-serif;
  fill: #20344c;
}
.illustration-subtitle {
  font:
    500 12px system-ui,
    sans-serif;
  fill: #52677d;
}
.illustration-node {
  font:
    600 11px system-ui,
    sans-serif;
  fill: #263d52;
}
.illustration-memory {
  font:
    600 11px system-ui,
    sans-serif;
  fill: var(--illustration-accent);
}
.illustration-icon,
.illustration-arrow {
  fill: none;
  stroke: var(--illustration-accent);
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.illustration-path,
.illustration-return {
  fill: none;
  stroke: var(--illustration-accent);
  stroke-width: 1.5;
  opacity: 0.35;
}
.illustration-pulse {
  fill: var(--illustration-accent);
  animation: flow 2.8s ease-in-out infinite;
}
.illustration-pulse-two {
  animation-delay: 1.4s;
}
@keyframes flow {
  0%,
  15% {
    transform: translateX(0);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  80%,
  100% {
    transform: translateX(10px);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .illustration-pulse {
    animation: none;
    opacity: 0;
  }
}
</style>
