<script setup lang="ts">
import { computed } from "vue";
import type { Project, Publication } from "../types";

const props = defineProps<{
  item: Publication | Project;
  authorLinks: Record<string, string>;
  showTag?: boolean;
}>();

const authorsHtml = computed(() => {
  const publication = props.item as Publication;

  return formatAuthors(
    props.item.authors,
    publication.firstAuthors,
    publication.correspondingAuthors,
    props.authorLinks,
  );
});

const htmlEscapes: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

function splitAuthorList(value: string) {
  return value
    .split(/,\s*/)
    .map((author) => author.trim())
    .filter(Boolean);
}

function formatAuthors(
  authorString = "",
  firstAuthorsString = "",
  correspondingAuthorsString = "",
  authorLinks: Record<string, string> = {},
) {
  const firstAuthors = splitAuthorList(firstAuthorsString);
  const correspondingAuthors = splitAuthorList(correspondingAuthorsString);
  const hasCoFirstAuthors = firstAuthors.length > 1;

  return splitAuthorList(authorString)
    .map((author) => {
      let formattedAuthor = escapeHtml(author);

      if (author === "Yinghao Zhu") {
        formattedAuthor = `<strong class="author-highlight">${formattedAuthor}</strong>`;
      } else if (authorLinks[author]) {
        formattedAuthor = `<a href="${authorLinks[author]}" target="_blank" rel="noopener noreferrer" class="author-link">${formattedAuthor}</a>`;
      }

      if (hasCoFirstAuthors && firstAuthors.includes(author)) {
        formattedAuthor +=
          '<sup class="text-text-gray-light font-bold">*</sup>';
      }

      if (correspondingAuthors.includes(author)) {
        formattedAuthor +=
          '<sup class="text-text-gray-light font-bold">†</sup>';
      }

      return formattedAuthor;
    })
    .join(", ");
}
</script>

<template>
  <article class="publication-card">
    <div class="min-w-0 flex-1">
      <h4 class="mb-1 text-sm font-semibold leading-tight text-text-gray">
        {{ item.title }}
      </h4>
      <p class="mb-1 text-xs text-text-gray" v-html="authorsHtml" />
      <p v-if="item.venue" class="mb-2 text-xs italic text-primary-blue">
        {{ item.venue }}
      </p>
      <div v-if="item.links?.length" class="flex flex-wrap gap-1.5">
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
