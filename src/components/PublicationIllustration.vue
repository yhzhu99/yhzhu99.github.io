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
    :aria-label="illustration.description"
    :style="{
      '--accent-light': illustration.light,
      '--accent-dark': illustration.dark,
      '--background-dark': illustration.background,
    }"
  >
    <defs>
      <linearGradient :id="`surface-${name}`" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="var(--background)" />
        <stop offset="1" stop-color="var(--surface-end)" />
      </linearGradient>
      <linearGradient :id="`glow-${name}`" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="var(--accent)" stop-opacity=".35" />
        <stop offset="1" stop-color="var(--accent)" stop-opacity="0" />
      </linearGradient>
    </defs>
    <rect width="300" height="174" rx="9" :fill="`url(#surface-${name})`" />
    <circle cx="274" cy="12" r="54" fill="var(--accent)" opacity=".06" />
    <text x="18" y="25" class="label">{{ illustration.title }}</text>
    <path
      d="M18 34h28"
      stroke="var(--accent)"
      stroke-width="2"
      stroke-linecap="round"
    />

    <!-- HealthFlow: four agents around a governed-memory core. -->
    <g v-if="name === 'healthflow'">
      <ellipse
        cx="160"
        cy="100"
        rx="78"
        ry="43"
        fill="none"
        stroke="var(--accent)"
        stroke-opacity=".3"
        stroke-width="1.5"
        stroke-dasharray="3 5"
      />
      <circle
        cx="160"
        cy="100"
        r="30"
        fill="var(--accent)"
        fill-opacity=".13"
        stroke="var(--accent)"
        stroke-opacity=".5"
      />
      <circle cx="160" cy="100" r="19" fill="var(--accent)" fill-opacity=".2" />
      <path d="M151 100h18M160 91v18" class="accent-line" />
      <circle class="breathe" cx="160" cy="100" r="5" fill="var(--accent)" />
      <g class="small-label" text-anchor="middle">
        <text x="160" y="53">PLAN</text>
        <text x="251" y="104">EXECUTE</text>
        <text x="160" y="158">EVALUATE</text>
        <text x="68" y="104">REFLECT</text>
      </g>
      <circle cx="160" cy="58" r="4" fill="var(--accent)" />
      <circle cx="238" cy="100" r="4" fill="var(--accent)" />
      <circle cx="160" cy="143" r="4" fill="var(--accent)" />
      <circle cx="82" cy="100" r="4" fill="var(--accent)" />
      <circle r="3" fill="var(--accent)" class="orbit" />
    </g>

    <!-- AICare: a clinician-facing chart with interactive evidence panels. -->
    <g v-else-if="name === 'aicare'">
      <rect x="35" y="52" width="182" height="91" rx="10" class="glass" />
      <path d="M48 121h154M48 98h154M48 75h154" class="grid-line" />
      <path
        d="M49 120 C65 115 72 119 84 104 S105 108 118 91 137 101 150 82 174 92 202 67 V132 H49Z"
        :fill="`url(#glow-${name})`"
      />
      <path
        d="M49 120 C65 115 72 119 84 104 S105 108 118 91 137 101 150 82 174 92 202 67"
        class="accent-line chart-line"
      />
      <circle cx="150" cy="82" r="5" fill="var(--accent)" class="breathe" />
      <rect x="205" y="66" width="58" height="69" rx="8" fill="#f2f9ff" />
      <rect x="216" y="78" width="34" height="5" rx="2.5" fill="#6aaed4" />
      <rect x="216" y="90" width="25" height="4" rx="2" fill="#b4cddd" />
      <rect x="216" y="100" width="30" height="4" rx="2" fill="#b4cddd" />
      <rect x="216" y="113" width="19" height="10" rx="5" fill="#b2e4d6" />
    </g>

    <!-- A longitudinal risk curve and a focal clinical milestone. -->
    <g v-else-if="name === 'gestacare'">
      <path d="M15 132H285 M15 105H285 M15 78H285" class="grid-line" />
      <path
        d="M15 128 C45 124 54 116 76 119 S108 97 131 102 163 87 184 89 218 73 247 64 269 57 285 52 V143H15Z"
        :fill="`url(#glow-${name})`"
      />
      <path
        d="M15 128 C45 124 54 116 76 119 S108 97 131 102 163 87 184 89 218 73 247 64 269 57 285 52"
        class="accent-line chart-line"
      />
      <path
        d="M218 49v92"
        stroke="var(--accent)"
        stroke-opacity=".45"
        stroke-dasharray="3 4"
      />
      <circle
        cx="218"
        cy="76"
        r="14"
        fill="var(--background)"
        stroke="var(--accent)"
        stroke-width="2"
      />
      <circle cx="218" cy="76" r="5" fill="var(--accent)" class="breathe" />
      <text x="18" y="158" class="small-label">LONGITUDINAL CARE</text>
      <text x="233" y="158" class="small-label">RISK</text>
    </g>

    <!-- MedAgentBoard: a four-task benchmark matrix. -->
    <g v-else-if="name === 'medagentboard'">
      <g transform="translate(36 52)">
        <rect width="105" height="42" rx="9" class="glass" />
        <rect x="115" width="105" height="42" rx="9" class="glass" />
        <rect y="51" width="105" height="42" rx="9" class="glass" />
        <rect x="115" y="51" width="105" height="42" rx="9" class="glass" />
        <g class="tile-text">
          <text x="35" y="26">QA</text>
          <text x="153" y="26">EHR</text>
          <text x="23" y="77">SUMMARY</text>
          <text x="142" y="77">WORKFLOW</text>
        </g>
        <circle cx="16" cy="21" r="4" fill="#ffbd9b" class="breathe" />
        <circle
          cx="131"
          cy="21"
          r="4"
          fill="#91d8fc"
          class="breathe delay-one"
        />
        <circle
          cx="16"
          cy="72"
          r="4"
          fill="#b9a9ff"
          class="breathe delay-two"
        />
        <circle
          cx="131"
          cy="72"
          r="4"
          fill="#9ce7c3"
          class="breathe delay-three"
        />
      </g>
    </g>

    <!-- Audit: a lens isolates a risk in a collaboration network. -->
    <g v-else-if="name === 'medagentaudit'">
      <path
        d="M63 77 122 63 168 96 114 133 63 77M122 63l-8 70M168 96l48-31"
        class="network-line"
      />
      <circle cx="63" cy="77" r="9" class="network-node" />
      <circle cx="122" cy="63" r="11" class="network-node" />
      <circle cx="114" cy="133" r="9" class="network-node" />
      <circle
        cx="168"
        cy="96"
        r="13"
        fill="#ffba7d"
        fill-opacity=".35"
        stroke="#ffba7d"
        stroke-width="2"
      />
      <circle cx="216" cy="65" r="8" class="network-node" />
      <circle
        cx="168"
        cy="96"
        r="31"
        fill="none"
        stroke="var(--accent)"
        stroke-width="3"
      />
      <path
        d="m190 118 25 26"
        stroke="var(--accent)"
        stroke-width="7"
        stroke-linecap="round"
      />
      <path
        d="M168 87v12m0 6v1"
        stroke="var(--ink)"
        stroke-width="3"
        stroke-linecap="round"
      />
      <circle
        cx="168"
        cy="96"
        r="23"
        fill="none"
        stroke="var(--accent)"
        stroke-opacity=".3"
        class="breathe"
      />
    </g>

    <!-- ClinicRealm: balanced evaluation of two modeling families. -->
    <g v-else-if="name === 'clinicrealm'">
      <path
        d="M150 55v77M82 88h136M106 143h88"
        stroke="var(--accent)"
        stroke-opacity=".55"
        stroke-width="2"
      />
      <path
        d="m84 88-25 32h50L84 88Zm132 0-25 32h50l-25-32Z"
        fill="var(--accent)"
        fill-opacity=".13"
        stroke="var(--accent)"
        stroke-opacity=".7"
      />
      <circle
        cx="150"
        cy="86"
        r="17"
        fill="var(--accent)"
        fill-opacity=".22"
        stroke="var(--accent)"
        stroke-opacity=".6"
      />
      <text x="150" y="90" text-anchor="middle" class="tile-text">VS</text>
      <text x="84" y="110" text-anchor="middle" class="tile-text">LLM</text>
      <text x="216" y="110" text-anchor="middle" class="tile-text">ML</text>
      <circle
        cx="150"
        cy="86"
        r="25"
        fill="none"
        stroke="var(--accent)"
        stroke-opacity=".25"
        class="breathe"
      />
    </g>

    <!-- ColaCare: a shared decision formed by specialist agents. -->
    <g v-else-if="name === 'colacare'">
      <path
        d="M150 97 75 61 M150 97 225 61 M150 97 75 139 M150 97 225 139"
        class="network-line"
      />
      <circle
        cx="150"
        cy="97"
        r="30"
        fill="var(--accent)"
        fill-opacity=".17"
        stroke="var(--accent)"
        stroke-opacity=".7"
      />
      <path
        d="m138 97 8 8 16-18"
        fill="none"
        stroke="var(--accent)"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <g fill="var(--background)" stroke="var(--accent)" stroke-width="1.5">
        <circle cx="75" cy="61" r="16" />
        <circle cx="225" cy="61" r="16" />
        <circle cx="75" cy="139" r="16" />
        <circle cx="225" cy="139" r="16" />
      </g>
      <g fill="none" stroke="var(--accent)" stroke-width="1.7">
        <circle cx="75" cy="57" r="4" />
        <path d="M67 69c0-6 16-6 16 0" />
        <circle cx="225" cy="57" r="4" />
        <path d="M217 69c0-6 16-6 16 0" />
        <circle cx="75" cy="135" r="4" />
        <path d="M67 147c0-6 16-6 16 0" />
        <circle cx="225" cy="135" r="4" />
        <path d="M217 147c0-6 16-6 16 0" />
      </g>
      <circle
        cx="150"
        cy="97"
        r="38"
        fill="none"
        stroke="var(--accent)"
        stroke-opacity=".25"
        class="breathe"
      />
    </g>

    <!-- EMERGE: multiple EHR modalities and a retrieval lens. -->
    <g v-else-if="name === 'emerge'">
      <rect
        x="49"
        y="76"
        width="83"
        height="69"
        rx="9"
        class="glass"
        transform="rotate(-10 90 110)"
      />
      <rect
        x="92"
        y="60"
        width="83"
        height="76"
        rx="9"
        fill="#d1eeff"
        fill-opacity=".13"
        stroke="var(--accent)"
        stroke-opacity=".6"
      />
      <path
        d="M108 78h51M108 91h36M108 104h43M108 117h25"
        stroke="var(--accent)"
        stroke-opacity=".65"
        stroke-width="3"
        stroke-linecap="round"
      />
      <circle
        cx="194"
        cy="99"
        r="28"
        fill="var(--background)"
        stroke="var(--accent)"
        stroke-width="4"
      />
      <circle
        cx="194"
        cy="99"
        r="36"
        fill="none"
        stroke="var(--accent)"
        stroke-opacity=".3"
        class="breathe"
      />
      <path
        d="m214 120 24 24"
        stroke="var(--accent)"
        stroke-width="8"
        stroke-linecap="round"
      />
      <path
        d="m183 99 7 7 14-16"
        fill="none"
        stroke="var(--accent)"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>

    <!-- COVID benchmark: model families compared on a shared evaluation axis. -->
    <g v-else-if="name === 'pyehr'">
      <path d="M52 143h203M52 55v88M52 114h203M52 85h203" class="grid-line" />
      <rect
        x="75"
        y="103"
        width="24"
        height="40"
        rx="5"
        fill="#f3a2a8"
        opacity=".85"
      />
      <rect
        x="110"
        y="76"
        width="24"
        height="67"
        rx="5"
        fill="#c0b3fa"
        opacity=".9"
        class="bar-glow"
      />
      <rect
        x="145"
        y="91"
        width="24"
        height="52"
        rx="5"
        fill="#83cce4"
        opacity=".9"
      />
      <rect
        x="180"
        y="61"
        width="24"
        height="82"
        rx="5"
        fill="#ffcf9b"
        opacity=".9"
        class="bar-glow delay-one"
      />
      <rect
        x="215"
        y="82"
        width="24"
        height="61"
        rx="5"
        fill="#96d7c1"
        opacity=".9"
      />
      <path
        d="M72 65h72"
        stroke="var(--accent)"
        stroke-width="2"
        stroke-linecap="round"
        opacity=".55"
      />
      <text x="72" y="56" class="small-label">MODEL COMPARISON</text>
    </g>
  </svg>
</template>

<style scoped>
.publication-illustration {
  --accent: var(--accent-light);
  --background: color-mix(in srgb, var(--accent) 11%, #ffffff);
  --surface-end: #ffffff;
  --ink: #263d54;
  --glass-fill: #ffffff;
  --glass-stroke: var(--accent);
  display: block;
  width: 100%;
  height: 100%;
}
:global(.dark .publication-illustration) {
  --accent: var(--accent-dark);
  --background: var(--background-dark);
  --surface-end: #101c35;
  --ink: #f2f7ff;
  --glass-fill: var(--accent);
  --glass-stroke: #ffffff;
}
.label {
  font:
    700 12px system-ui,
    sans-serif;
  fill: var(--ink);
  letter-spacing: 1.2px;
}
.small-label {
  font:
    700 9px system-ui,
    sans-serif;
  fill: var(--ink);
  fill-opacity: 0.8;
  letter-spacing: 0.4px;
}
.tile-text {
  font:
    700 10px system-ui,
    sans-serif;
  fill: var(--ink);
  letter-spacing: 0.5px;
}
.glass {
  fill: var(--glass-fill);
  fill-opacity: 0.56;
  stroke: var(--glass-stroke);
  stroke-opacity: 0.18;
}
:global(.dark .publication-illustration .glass) {
  fill-opacity: 0.09;
}
.grid-line {
  fill: none;
  stroke: var(--accent);
  stroke-opacity: 0.12;
  stroke-width: 1;
}
.accent-line {
  fill: none;
  stroke: var(--accent);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.chart-line {
  stroke-width: 3;
}
.network-line {
  fill: none;
  stroke: var(--accent);
  stroke-opacity: 0.4;
  stroke-width: 2;
}
.network-node {
  fill: var(--background);
  stroke: var(--accent);
  stroke-opacity: 0.7;
  stroke-width: 2;
}
.breathe {
  transform-box: fill-box;
  transform-origin: center;
  animation: breathe 3.6s ease-in-out infinite;
}
.orbit {
  offset-path: path("M160 57a78 43 0 1 1 0 86a78 43 0 1 1 0 -86");
  animation: orbit 9s linear infinite;
}
.delay-one {
  animation-delay: 0.7s;
}
.delay-two {
  animation-delay: 1.4s;
}
.delay-three {
  animation-delay: 2.1s;
}
.bar-glow {
  animation: bar-glow 3.6s ease-in-out infinite;
}
@keyframes bar-glow {
  50% {
    opacity: 0.55;
  }
}
@keyframes breathe {
  50% {
    transform: scale(1.15);
    opacity: 0.6;
  }
}
@keyframes orbit {
  to {
    offset-distance: 100%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .breathe,
  .orbit,
  .bar-glow {
    animation: none;
  }
}
</style>
