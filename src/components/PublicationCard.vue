<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import type { Project, Publication } from "../types";
import {
  formatBibtex,
  formatAuthorsHtml,
  formatVenueYear,
  getPublicationAuthorFields,
} from "../utils/publications";

const props = defineProps<{
  item: Publication | Project;
  authorLinks: Record<string, string>;
  showTag?: boolean;
}>();

const copyState = ref<"idle" | "copied" | "failed">("idle");
const authorDetailsOpen = ref(false);
const authorsTruncated = ref(false);
const authorTrigger = ref<HTMLElement>();
const authorTooltipStyle = ref<Record<string, string>>({});
let copyStateTimeout: ReturnType<typeof setTimeout> | undefined;
let authorResizeObserver: ResizeObserver | undefined;

const authorFields = computed(() => getPublicationAuthorFields(props.item));

const authorsHtml = computed(() => {
  return formatAuthorsHtml({
    authors: props.item.authors,
    firstAuthors: authorFields.value.firstAuthors,
    correspondingAuthors: authorFields.value.correspondingAuthors,
    authorLinks: props.authorLinks,
  });
});

const tooltipAuthorsHtml = computed(() =>
  formatAuthorsHtml({
    authors: props.item.authors,
    firstAuthors: authorFields.value.firstAuthors,
    correspondingAuthors: authorFields.value.correspondingAuthors,
  }),
);

const authorTooltipId = computed(() => `author-details-${props.item.uid}`);

const bibtex = computed(() => {
  if (!("publicationType" in props.item)) return "";

  return formatBibtex(props.item);
});

async function copyBibtex() {
  try {
    await navigator.clipboard.writeText(bibtex.value);
    copyState.value = "copied";
  } catch {
    copyState.value = "failed";
  }

  clearTimeout(copyStateTimeout);
  copyStateTimeout = setTimeout(() => {
    copyState.value = "idle";
  }, 1600);
}

function showAuthorDetails() {
  const trigger = authorTrigger.value;

  if (!trigger) return;

  updateAuthorOverflow();

  if (!authorsTruncated.value) return;

  const rect = trigger.getBoundingClientRect();
  const viewportMargin = 12;
  const tooltipGap = 8;
  const tooltipWidth = Math.min(576, window.innerWidth - viewportMargin * 2);
  const spaceBelow = window.innerHeight - rect.bottom;
  const showAbove = spaceBelow < 260 && rect.top > spaceBelow;
  const availableHeight = showAbove ? rect.top : spaceBelow;
  const left = Math.max(
    viewportMargin,
    Math.min(
      rect.left + rect.width / 2 - tooltipWidth / 2,
      window.innerWidth - tooltipWidth - viewportMargin,
    ),
  );

  authorTooltipStyle.value = {
    left: `${left}px`,
    top: `${showAbove ? rect.top - tooltipGap : rect.bottom + tooltipGap}px`,
    width: `${tooltipWidth}px`,
    maxHeight: `${Math.max(96, Math.min(360, availableHeight - tooltipGap - viewportMargin))}px`,
    transform: showAbove ? "translateY(-100%)" : "none",
  };
  authorDetailsOpen.value = true;

  window.addEventListener("resize", hideAuthorDetails);
  window.addEventListener("scroll", hideAuthorDetails, true);
}

function hideAuthorDetails() {
  authorDetailsOpen.value = false;
  window.removeEventListener("resize", hideAuthorDetails);
  window.removeEventListener("scroll", hideAuthorDetails, true);
}

function updateAuthorOverflow() {
  const trigger = authorTrigger.value;

  if (!trigger) return;

  authorsTruncated.value = trigger.scrollHeight > trigger.clientHeight + 1;

  if (!authorsTruncated.value) hideAuthorDetails();
}

onMounted(async () => {
  await nextTick();
  updateAuthorOverflow();

  if (authorTrigger.value) {
    authorResizeObserver = new ResizeObserver(updateAuthorOverflow);
    authorResizeObserver.observe(authorTrigger.value);
  }
});

onBeforeUnmount(() => {
  clearTimeout(copyStateTimeout);
  authorResizeObserver?.disconnect();
  hideAuthorDetails();
});
</script>

<template>
  <article class="publication-card">
    <div class="min-w-0 flex-1">
      <h4 class="mb-1 text-sm font-semibold leading-tight text-text-gray">
        {{ item.title }}
      </h4>
      <p
        ref="authorTrigger"
        class="mb-1 line-clamp-3 rounded-sm text-xs text-text-gray outline-none focus-visible:ring-2 focus-visible:ring-primary-blue/40"
        :class="authorsTruncated ? 'cursor-help' : ''"
        :tabindex="authorsTruncated ? 0 : undefined"
        :aria-describedby="authorDetailsOpen ? authorTooltipId : undefined"
        @mouseenter="showAuthorDetails"
        @mouseleave="hideAuthorDetails"
        @focusin="showAuthorDetails"
        @focusout="hideAuthorDetails"
        @keydown.esc="hideAuthorDetails"
        v-html="authorsHtml"
      />
      <p v-if="item.venue" class="mb-2 text-xs italic text-primary-blue">
        {{ formatVenueYear(item.venue, item.year) }}
      </p>
      <div v-if="item.links?.length || bibtex" class="flex flex-wrap gap-1.5">
        <a
          v-for="link in item.links"
          :key="`${item.uid}-${link.type}`"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-full bg-slate-50 px-2.5 py-1 text-xs text-text-gray-light ring-1 ring-inset ring-slate-900/5 transition-colors hover:bg-slate-200/60 hover:text-text-gray"
        >
          {{ link.type }}
        </a>
        <button
          v-if="bibtex"
          type="button"
          class="rounded-full bg-slate-50 px-2.5 py-1 text-xs text-text-gray-light ring-1 ring-inset ring-slate-900/5 transition-colors hover:bg-slate-200/60 hover:text-text-gray"
          :aria-label="`Copy BibTeX for ${item.title}`"
          @click="copyBibtex"
        >
          {{
            copyState === "copied"
              ? "Copied!"
              : copyState === "failed"
                ? "Copy failed"
                : "BibTeX"
          }}
        </button>
      </div>
    </div>
    <div
      class="publication-meta flex flex-shrink-0 flex-col items-end gap-1 text-right"
    >
      <span class="time-tag">{{ item.year }}</span>
      <span v-if="showTag && 'tag' in item && item.tag" class="tag-chip">
        {{ item.tag }}
      </span>
    </div>
  </article>

  <Teleport to="body">
    <Transition name="fade">
      <aside
        v-if="authorDetailsOpen"
        :id="authorTooltipId"
        class="pointer-events-none fixed z-[100] overflow-y-auto rounded-lg border border-slate-200 bg-surface/95 p-3 text-left shadow-card backdrop-blur-md"
        :style="authorTooltipStyle"
        role="tooltip"
      >
        <p
          class="text-xs leading-relaxed text-text-gray"
          v-html="tooltipAuthorsHtml"
        />
      </aside>
    </Transition>
  </Teleport>
</template>
