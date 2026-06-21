<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { mountWorldScene } from "../world/scene";
import "../world/world.css";

let cleanup: (() => void) | undefined;

onMounted(() => {
  cleanup = mountWorldScene();
});

onBeforeUnmount(() => {
  cleanup?.();
});
</script>

<template>
  <main class="world-page">
    <canvas id="scene"></canvas>

    <div id="loader">
      <div class="loader-cube">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p>Opening Workstation at BUAA...</p>
    </div>

    <div id="topbar">
      <div class="brand">
        <div class="dot"></div>
        <div>
          <h1>
            Yinghao Zhu
            <span>朱英豪</span>
          </h1>
          <div class="sub">3D Workspace · Workstation at BUAA</div>
        </div>
      </div>
      <RouterLink id="back-btn" to="/">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to homepage
      </RouterLink>
    </div>

    <div id="hotspots"></div>

    <div id="hint">
      <span><b>Guided</b>Workstation at BUAA</span>
      <span class="sep"></span>
      <span><b>Bright</b>desk scene</span>
    </div>

    <div id="panel-overlay">
      <div id="panel">
        <div class="panel-head">
          <div class="titles">
            <div id="panel-ic" class="ic"></div>
            <div>
              <div id="panel-kicker" class="kicker">Detail</div>
              <h2 id="panel-title">Title</h2>
            </div>
          </div>
          <button id="panel-close" class="close-btn" aria-label="Close">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div id="panel-body" class="panel-body"></div>
      </div>
    </div>
  </main>
</template>
