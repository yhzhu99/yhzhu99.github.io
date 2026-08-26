<script setup lang="ts">
import { computed, ref } from "vue";
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
let copyStateTimeout: ReturnType<typeof setTimeout> | undefined;

const authorsHtml = computed(() => {
  const authorFields = getPublicationAuthorFields(props.item);

  return formatAuthorsHtml({
    authors: props.item.authors,
    firstAuthors: authorFields.firstAuthors,
    correspondingAuthors: authorFields.correspondingAuthors,
    authorLinks: props.authorLinks,
  });
});

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
</script>

<template>
  <article class="publication-card">
    <div class="min-w-0 flex-1">
      <h4 class="mb-1 text-sm font-semibold leading-tight text-text-gray">
        {{ item.title }}
      </h4>
      <p
        class="mb-1 line-clamp-3 text-xs text-text-gray"
        :title="item.authors"
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
</template>
