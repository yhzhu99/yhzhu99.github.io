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
      <div class="loader-mark" aria-hidden="true">
        <div class="loader-cube">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <div class="loader-copy">
        <strong>Yinghao's workspace</strong>
        <p>Preparing the room</p>
      </div>
    </div>

    <div id="topbar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">
          <span></span>
        </div>
        <div>
          <h1>
            Yinghao Zhu
            <span>朱英豪</span>
          </h1>
          <div class="sub">A quiet corner at BUAA</div>
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
        <span>Homepage</span>
      </RouterLink>
    </div>

    <div id="hotspots" aria-label="Interactive objects"></div>

    <div id="scene-guide" aria-label="Scene controls">
      <span class="guide-status"><i></i> Explore the room</span>
      <span class="guide-divider"></span>
      <span class="guide-item">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          aria-hidden="true"
        >
          <path
            d="M8 7.5V6a1.5 1.5 0 0 1 3 0v1.5M11 7.5V5a1.5 1.5 0 0 1 3 0v2.5M14 7.5V6a1.5 1.5 0 0 1 3 0v5l1.1-1.1a1.6 1.6 0 0 1 2.3 2.2l-4 5.3A4 4 0 0 1 13.2 19H11a4 4 0 0 1-3.4-1.9L5 12.8a1.5 1.5 0 0 1 2.5-1.6L8 12V7.5Z"
          />
        </svg>
        Drag to look around
      </span>
      <span class="guide-item guide-zoom">Scroll to zoom</span>
      <span class="guide-item guide-mobile">Drag to look · Tap a marker</span>
    </div>

    <div id="panel-overlay" aria-hidden="true">
      <div
        id="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        <div class="panel-head">
          <div class="titles">
            <div id="panel-ic" class="ic"></div>
            <div>
              <div id="panel-kicker" class="kicker">Detail</div>
              <h2 id="panel-title">Title</h2>
            </div>
          </div>
          <button
            id="panel-close"
            class="close-btn"
            type="button"
            aria-label="Close panel"
          >
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
