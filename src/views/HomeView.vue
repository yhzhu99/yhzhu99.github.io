<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import ModalDialog from "../components/ModalDialog.vue";
import NewsList from "../components/NewsList.vue";
import PublicationCard from "../components/PublicationCard.vue";
import QuickLinks from "../components/QuickLinks.vue";
import TimelineColumn from "../components/TimelineColumn.vue";
import { siteData } from "../data";
import { profile, tabs } from "../site";
import type {
  AwardItem,
  ModalItem,
  Publication,
  ServiceModalState,
  TabId,
} from "../types";
import {
  formatServiceItemContent,
  isPublished,
  latestYear,
  publicationTagOrder,
  reviewerPreview,
  venuePriority,
} from "../utils/format";

const {
  authorLinks,
  awards,
  education,
  experience,
  newsItems,
  projects,
  publications,
  quickLinkIcons,
  quickLinks,
  services,
  talks,
} = siteData;

const activeTab = ref<TabId>("about");
const filterExpanded = ref(true);
const searchQuery = ref("");
const selectedYear = ref("");
const selectedTag = ref("");
const showMobileNav = ref(false);
const showNewsModal = ref(false);
const selectedService = ref<ServiceModalState | null>(null);
const desktopNav = ref<HTMLElement | null>(null);
const navIndicatorStyle = ref("");
const navIndicatorReady = ref(false);
let resizeObserver: ResizeObserver | null = null;

const featuredPublications = computed(() =>
  publications.filter((publication) => publication.featured),
);

const availableYears = computed(() =>
  [
    ...new Set(
      publications.map((publication) => publication.year).filter(Boolean),
    ),
  ].sort((a, b) => b.localeCompare(a)),
);

const publicationTags = computed(() => {
  const tagCounts = publications.reduce<Record<string, number>>(
    (counts, publication) => {
      if (publication.tag) {
        counts[publication.tag] = (counts[publication.tag] ?? 0) + 1;
      }

      return counts;
    },
    {},
  );

  return Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      if (a.name === "Other Topics") return 1;
      if (b.name === "Other Topics") return -1;

      const indexA = publicationTagOrder.indexOf(a.name);
      const indexB = publicationTagOrder.indexOf(b.name);

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      return b.count - a.count;
    });
});

const filteredPublications = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const base =
    selectedTag.value === "All"
      ? publications
      : selectedTag.value
        ? publications.filter(
            (publication) => publication.tag === selectedTag.value,
          )
        : featuredPublications.value;

  return [...base]
    .filter((publication) => {
      const searchable = [
        publication.title,
        publication.authors,
        publication.venue,
        publication.tag,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (!selectedYear.value || publication.year === selectedYear.value)
      );
    })
    .sort(sortPublications);
});

function selectTab(tabId: TabId) {
  activeTab.value = tabId;
  showMobileNav.value = false;
  nextTick(updateNavIndicator);
}

function selectPublicationTag(tag: string) {
  selectedTag.value = selectedTag.value === tag ? "" : tag;
}

function openAllPublications() {
  activeTab.value = "publications";
  selectedTag.value = "All";
}

function openServiceModal(title: string) {
  if (title === "Awards & Honors" || title === "Talks & Interviews") {
    const source = title === "Awards & Honors" ? awards : talks;
    selectedService.value = {
      title,
      items: source
        .slice()
        .sort((a, b) => b.year.localeCompare(a.year))
        .map(toAwardModalItem),
    };
    return;
  }

  const service = services.find((item) => item.title === title);
  selectedService.value = {
    title,
    items: (service?.items ?? [])
      .slice()
      .sort((a, b) => {
        const yearDiff =
          latestYear(String(b.year)) - latestYear(String(a.year));
        return yearDiff || a.content.localeCompare(b.content);
      })
      .map(
        (item): ModalItem => ({
          uid: item.uid,
          date: item.year,
          content: formatServiceItemContent(item),
        }),
      ),
  };
}

function closeModals() {
  showNewsModal.value = false;
  selectedService.value = null;
}

function updateNavIndicator() {
  const nav = desktopNav.value;
  const button = nav?.querySelector<HTMLElement>(
    `[data-tab-id="${activeTab.value}"]`,
  );

  if (!nav || !button) {
    return;
  }

  const navRect = nav.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();
  const x = buttonRect.left - navRect.left - (nav.clientLeft || 0);

  navIndicatorStyle.value = `transform: translateX(${x}px); width: ${buttonRect.width}px;`;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    closeModals();
    showMobileNav.value = false;
  }
}

function sortPublications(a: Publication, b: Publication) {
  if (a.year !== b.year) {
    return b.year.localeCompare(a.year);
  }

  const publishedDiff =
    Number(isPublished(b.venue)) - Number(isPublished(a.venue));
  if (publishedDiff) {
    return publishedDiff;
  }

  const priorityDiff = venuePriority(a.venue) - venuePriority(b.venue);
  return priorityDiff || a.title.localeCompare(b.title);
}

function toAwardModalItem(item: AwardItem): ModalItem {
  return {
    uid: item.uid,
    date: item.year,
    content: formatServiceItemContent(item),
  };
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("resize", updateNavIndicator);

  nextTick(() => {
    updateNavIndicator();
    requestAnimationFrame(() => {
      navIndicatorReady.value = true;
    });

    if (desktopNav.value) {
      resizeObserver = new ResizeObserver(updateNavIndicator);
      resizeObserver.observe(desktopNav.value);
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("resize", updateNavIndicator);
  resizeObserver?.disconnect();
});

watch(activeTab, () => {
  nextTick(updateNavIndicator);
});
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-bg-light font-academic text-text-gray">
    <header
      class="sticky top-0 z-50 flex-shrink-0 border-b border-slate-200/70 bg-white/90 backdrop-blur-md transition-all duration-300"
    >
      <div class="mx-auto max-w-screen-2xl px-4 py-1.5 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <button
            type="button"
            class="flex min-w-0 items-center gap-3 rounded-sm text-left transition-opacity hover:opacity-80"
            aria-label="Show About section"
            @click="selectTab('about')"
          >
            <span
              class="h-6 w-1 rounded-full bg-primary-blue"
              aria-hidden="true"
            />
            <span
              class="truncate text-lg font-bold tracking-tight text-text-gray md:text-xl"
            >
              Yinghao Zhu
            </span>
            <span class="hidden text-xl text-text-gray-light sm:inline"
              >朱英豪</span
            >
            <img
              src="https://www.hku.hk/f/page/7561/150p169/1d@750.jpg"
              alt="HKU Logo"
              class="h-9 w-auto opacity-80 transition-opacity hover:opacity-100"
            />
          </button>

          <nav
            ref="desktopNav"
            class="relative hidden items-center gap-1 rounded-full bg-slate-900/[0.04] p-1 text-sm font-medium ring-1 ring-inset ring-slate-900/5 md:flex"
          >
            <span
              aria-hidden="true"
              class="pointer-events-none absolute bottom-1 left-0 top-1 rounded-full bg-white shadow-soft ring-1 ring-slate-900/5"
              :class="
                navIndicatorReady ? 'transition-all duration-300 ease-out' : ''
              "
              :style="navIndicatorStyle"
              style="will-change: transform, width"
            />
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              :data-tab-id="tab.id"
              class="relative z-10 rounded-full px-4 py-1.5 transition-colors duration-300 ease-out"
              :class="
                activeTab === tab.id
                  ? 'text-primary-blue'
                  : 'text-slate-500 hover:text-slate-900'
              "
              :aria-current="activeTab === tab.id ? 'page' : undefined"
              @click="selectTab(tab.id)"
            >
              {{ tab.name }}
            </button>
          </nav>

          <div class="relative md:hidden">
            <button
              type="button"
              class="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100"
              aria-label="Toggle navigation menu"
              :aria-expanded="showMobileNav"
              aria-controls="mobile-navigation"
              @click="showMobileNav = !showMobileNav"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  v-if="!showMobileNav"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div
              v-if="showMobileNav"
              id="mobile-navigation"
              class="absolute right-0 top-11 z-50 w-52 rounded-xl border border-slate-200/70 bg-white py-2 shadow-card"
            >
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                class="w-full px-4 py-2.5 text-left text-sm transition-colors"
                :class="
                  activeTab === tab.id
                    ? 'bg-primary-blue/5 font-semibold text-primary-blue'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                "
                @click="selectTab(tab.id)"
              >
                {{ tab.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="main-container flex-1 overflow-hidden">
      <div class="mx-auto h-full max-w-screen-2xl px-4 py-4 sm:px-6 lg:px-8">
        <div class="grid h-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-4">
          <aside class="hidden min-h-0 flex-col gap-4 overflow-hidden lg:flex">
            <section
              class="academic-card flex-shrink-0 rounded-lg p-4 text-center"
            >
              <img
                :src="profile.photo"
                :alt="profile.name"
                class="avatar-ring mx-auto mb-2 h-20 w-20 rounded-full object-cover transition-transform hover:scale-105"
              />
              <h2 class="mb-1 text-lg font-bold text-text-gray">
                {{ profile.name }}
              </h2>
              <p class="mb-2 text-sm text-text-gray-light">
                {{ profile.cnName }}
              </p>
              <a
                :href="`mailto:${profile.email}`"
                class="mb-2 block text-xs text-text-gray-light transition-colors hover:text-primary-blue"
              >
                {{ profile.email }}
              </a>
              <p class="text-xs font-semibold text-primary-blue">
                {{ profile.title }}
              </p>
              <p class="text-xs text-text-gray-light">
                {{ profile.affiliation }}
              </p>
              <p class="text-xs text-text-gray-light/75">
                {{ profile.school }}
              </p>
            </section>

            <section class="academic-card flex-shrink-0 rounded-lg p-3">
              <h3
                class="mb-3 border-b border-slate-200 pb-2 text-sm font-semibold tracking-tight text-text-gray"
              >
                Quick Links
              </h3>
              <QuickLinks :links="quickLinks" :icons="quickLinkIcons" />
            </section>

            <section
              class="academic-card flex min-h-0 flex-1 flex-col rounded-lg p-3"
            >
              <div
                class="mb-2 flex flex-shrink-0 items-center justify-between border-b border-slate-200 pb-2"
              >
                <h3 class="text-sm font-semibold tracking-tight text-text-gray">
                  Recent News
                </h3>
                <button
                  type="button"
                  class="view-all-btn"
                  aria-label="View all news"
                  @click="showNewsModal = true"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                </button>
              </div>
              <div
                class="scrollable-container min-h-0 flex-1 overflow-y-auto pr-1"
              >
                <NewsList :items="newsItems" :limit="10" />
              </div>
            </section>
          </aside>

          <section
            class="academic-card col-span-1 flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg lg:col-span-3"
          >
            <div
              v-show="activeTab === 'about'"
              class="panel-pane scrollable-container flex h-full min-w-0 flex-col overflow-y-auto p-4 lg:p-6"
            >
              <div class="mb-6 lg:hidden">
                <div class="mb-4 text-center">
                  <img
                    :src="profile.photo"
                    :alt="profile.name"
                    class="avatar-ring mx-auto mb-3 h-20 w-20 rounded-full object-cover"
                  />
                  <h2 class="mb-1 text-xl font-bold text-text-gray">
                    {{ profile.name }}
                  </h2>
                  <p class="mb-2 text-text-gray-light">{{ profile.cnName }}</p>
                  <p class="text-sm font-semibold text-primary-blue">
                    {{ profile.title }}
                  </p>
                  <p class="text-sm text-text-gray-light">
                    {{ profile.affiliation }}
                  </p>
                </div>
                <QuickLinks :links="quickLinks" :icons="quickLinkIcons" />
                <div class="mt-6">
                  <div class="mb-3 flex items-center justify-between">
                    <h3
                      class="text-sm font-semibold tracking-tight text-text-gray"
                    >
                      Recent News
                    </h3>
                    <button
                      type="button"
                      class="view-all-btn"
                      aria-label="View all news"
                      @click="showNewsModal = true"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </svg>
                    </button>
                  </div>
                  <NewsList :items="newsItems" :limit="3" />
                </div>
              </div>

              <div class="prose prose-sm max-w-none flex-shrink-0">
                <p
                  class="bio mb-4 leading-relaxed text-text-gray"
                  v-html="profile.bio"
                />
                <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <article
                    v-for="area in profile.interests"
                    :key="area.uid"
                    class="academic-border rounded-r-lg bg-slate-50 py-2.5 pl-4 pr-3 transition-colors hover:bg-slate-100"
                  >
                    <h5 class="text-sm font-semibold text-text-gray">
                      {{ area.title }}
                    </h5>
                    <p class="mt-1 text-xs text-text-gray-light">
                      {{ area.description ?? area.desc }}
                    </p>
                  </article>
                </div>
                <div
                  class="featured-publications-section hidden items-center justify-between gap-3 border-b border-slate-200 pb-2 md:flex"
                >
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <h4
                      class="text-lg font-semibold tracking-tight text-text-gray"
                    >
                      Featured Publications
                    </h4>
                    <div
                      class="flex items-center gap-4 text-xs text-text-gray-light"
                    >
                      <span
                        ><sup class="font-bold">*</sup> Co-first author</span
                      >
                      <span
                        ><sup class="font-bold">†</sup> Corresponding
                        author</span
                      >
                    </div>
                  </div>
                  <button
                    type="button"
                    class="view-all-btn flex-shrink-0"
                    aria-label="View all publications"
                    @click="openAllPublications"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  </button>
                </div>
              </div>

              <div
                class="featured-publications-section scrollable-container min-h-0 flex-1 overflow-y-auto pt-3"
              >
                <div class="hidden space-y-2 md:block">
                  <PublicationCard
                    v-for="publication in featuredPublications"
                    :key="publication.uid"
                    :item="publication"
                    :author-links="authorLinks"
                    show-tag
                  />
                </div>
              </div>
            </div>

            <div
              v-show="activeTab === 'publications'"
              class="panel-pane flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <div class="flex-shrink-0 border-b border-slate-200">
                <div class="p-3 pb-2 lg:p-4 lg:pb-3">
                  <button
                    type="button"
                    class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-bg-secondary/50"
                    @click="filterExpanded = !filterExpanded"
                  >
                    <span class="flex items-center gap-2">
                      <svg
                        class="h-4 w-4 text-primary-blue transition-transform"
                        :class="{ 'rotate-180': filterExpanded }"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      <span class="text-sm font-medium text-text-gray"
                        >Filters</span
                      >
                    </span>
                    <span class="text-xs text-text-gray-light">
                      {{ filterExpanded ? "Hide" : "Show" }}
                    </span>
                  </button>
                </div>

                <div v-show="filterExpanded" class="px-4 pb-4 lg:px-6 lg:pb-5">
                  <div
                    class="mb-3 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div class="flex min-w-0 flex-1 items-center gap-2">
                      <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search publications..."
                        class="min-w-[200px] flex-1 rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm transition-all focus:border-primary-blue focus:ring-1 focus:ring-primary-blue"
                      />
                      <select
                        v-model="selectedYear"
                        class="flex-shrink-0 rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm transition-all focus:border-primary-blue focus:ring-1 focus:ring-primary-blue"
                      >
                        <option value="">All Years</option>
                        <option
                          v-for="year in availableYears"
                          :key="year"
                          :value="year"
                        >
                          {{ year }}
                        </option>
                      </select>
                    </div>
                    <div
                      class="hidden space-x-4 text-xs text-text-gray-light sm:block"
                    >
                      <span
                        ><sup class="font-bold">*</sup> Co-first author</span
                      >
                      <span
                        ><sup class="font-bold">†</sup> Corresponding
                        author</span
                      >
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      class="publication-filter-tab"
                      :class="
                        selectedTag === ''
                          ? 'bg-primary-blue text-white'
                          : 'bg-bg-light text-text-gray hover:bg-primary-blue/10'
                      "
                      @click="selectedTag = ''"
                    >
                      Featured
                      <span class="publication-filter-tab-count"
                        >({{ featuredPublications.length }})</span
                      >
                    </button>
                    <button
                      type="button"
                      class="publication-filter-tab"
                      :class="
                        selectedTag === 'All'
                          ? 'bg-primary-blue text-white'
                          : 'bg-bg-light text-text-gray hover:bg-primary-blue/10'
                      "
                      @click="selectedTag = 'All'"
                    >
                      All
                      <span class="publication-filter-tab-count"
                        >({{ publications.length }})</span
                      >
                    </button>
                    <button
                      v-for="tag in publicationTags"
                      :key="tag.name"
                      type="button"
                      class="publication-filter-tab"
                      :class="
                        selectedTag === tag.name
                          ? 'bg-primary-blue text-white'
                          : 'bg-bg-light text-text-gray hover:bg-primary-blue/10'
                      "
                      @click="selectPublicationTag(tag.name)"
                    >
                      {{ tag.name }}
                      <span class="publication-filter-tab-count"
                        >({{ tag.count }})</span
                      >
                    </button>
                  </div>
                </div>
              </div>

              <div
                class="scrollable-container min-h-0 flex-1 overflow-y-auto p-4 pt-2 lg:p-6 lg:pt-2"
              >
                <div class="space-y-2">
                  <PublicationCard
                    v-for="publication in filteredPublications"
                    :key="publication.uid"
                    :item="publication"
                    :author-links="authorLinks"
                    show-tag
                  />
                  <p
                    v-if="!filteredPublications.length"
                    class="py-8 text-center text-sm text-text-gray-light"
                  >
                    No publications match the current filters.
                  </p>
                </div>
              </div>
            </div>

            <div
              v-show="activeTab === 'experience'"
              class="panel-pane scrollable-container flex-1 overflow-y-auto p-4 lg:p-6"
            >
              <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <TimelineColumn
                  title="Education"
                  :items="education"
                  kind="education"
                />
                <TimelineColumn
                  title="Professional Experience"
                  :items="experience"
                  kind="experience"
                />
              </div>
            </div>

            <div
              v-show="activeTab === 'awards'"
              class="panel-pane scrollable-container overflow-y-auto p-4 lg:p-6"
            >
              <div
                class="grid grid-cols-1 gap-4 border-b border-slate-200 pb-4 lg:grid-cols-2"
              >
                <section>
                  <div
                    class="mb-3 flex items-center justify-between border-b border-slate-200 pb-2"
                  >
                    <h3
                      class="text-lg font-semibold tracking-tight text-text-gray"
                    >
                      Awards & Honors
                    </h3>
                    <button
                      type="button"
                      class="view-all-btn"
                      aria-label="View all awards and honors"
                      @click="openServiceModal('Awards & Honors')"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </svg>
                    </button>
                  </div>
                  <div
                    class="mask-fade-bottom max-h-[30vh] space-y-1 overflow-y-auto pr-1"
                  >
                    <article
                      v-for="award in awards"
                      :key="award.uid"
                      class="unified-item rounded px-2 transition-colors hover:bg-slate-50"
                    >
                      <div class="unified-item-content">
                        <h4 class="mb-0.5 text-xs font-semibold text-text-gray">
                          {{ award.title }}
                        </h4>
                        <p class="text-xs text-text-gray-light">
                          {{ award.organization }}
                        </p>
                      </div>
                      <span class="time-tag">{{ award.year }}</span>
                    </article>
                  </div>
                </section>

                <section>
                  <div
                    class="mb-3 flex items-center justify-between border-b border-slate-200 pb-2"
                  >
                    <h3
                      class="text-lg font-semibold tracking-tight text-text-gray"
                    >
                      Talks & Interviews
                    </h3>
                    <button
                      type="button"
                      class="view-all-btn"
                      aria-label="View all talks and interviews"
                      @click="openServiceModal('Talks & Interviews')"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </svg>
                    </button>
                  </div>
                  <div
                    class="mask-fade-bottom max-h-[30vh] space-y-1 overflow-y-auto pr-1"
                  >
                    <article
                      v-for="talk in talks"
                      :key="talk.uid"
                      class="unified-item rounded px-2 transition-colors hover:bg-slate-50"
                    >
                      <div class="unified-item-content">
                        <h4 class="mb-0.5 text-xs font-semibold text-text-gray">
                          {{ talk.title }}
                        </h4>
                        <p class="text-xs text-text-gray-light">
                          {{ talk.venue }}
                        </p>
                      </div>
                      <span class="time-tag">{{ talk.year }}</span>
                    </article>
                  </div>
                </section>
              </div>

              <section class="pt-4">
                <h3
                  class="section-title mb-3 text-lg font-semibold tracking-tight text-text-gray"
                >
                  Projects
                </h3>
                <div class="space-y-2">
                  <PublicationCard
                    v-for="project in projects"
                    :key="project.uid"
                    :item="project"
                    :author-links="authorLinks"
                  />
                </div>
              </section>

              <section class="mt-4">
                <h3
                  class="section-title mb-3 text-lg font-semibold tracking-tight text-text-gray"
                >
                  Professional Services
                </h3>
                <div class="space-y-3">
                  <article v-for="service in services" :key="service.uid">
                    <div class="mb-2 flex items-center justify-between">
                      <h4 class="text-sm font-semibold text-text-gray">
                        {{ service.title }}
                      </h4>
                      <button
                        type="button"
                        class="view-all-btn"
                        :aria-label="`View all ${service.title}`"
                        @click="openServiceModal(service.title)"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <polyline points="15 3 21 3 21 9" />
                          <polyline points="9 21 3 21 3 15" />
                          <line x1="21" y1="3" x2="14" y2="10" />
                          <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                      </button>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="item in service.title === 'Reviewer'
                          ? reviewerPreview
                          : service.items
                              .slice(0, 8)
                              .map((entry) => entry.content)"
                        :key="`${service.uid}-${item}`"
                        class="rounded-md bg-slate-900/[0.03] px-2.5 py-1 font-mono text-xs text-text-gray-light ring-1 ring-inset ring-slate-900/5"
                      >
                        {{ item }}
                      </span>
                    </div>
                  </article>
                </div>
              </section>
            </div>
          </section>
        </div>
      </div>
    </main>

    <ModalDialog
      title="All News"
      :open="showNewsModal"
      @close="showNewsModal = false"
    >
      <NewsList :items="newsItems" />
    </ModalDialog>

    <ModalDialog
      :title="selectedService?.title ?? ''"
      :open="Boolean(selectedService)"
      @close="selectedService = null"
    >
      <div v-if="selectedService?.items.length" class="space-y-2">
        <article
          v-for="item in selectedService.items"
          :key="item.uid"
          class="modal-unified-item"
        >
          <div class="modal-unified-item-content">
            <p class="text-sm text-text-gray" v-html="item.content" />
          </div>
          <span class="time-tag">{{ item.date }}</span>
        </article>
      </div>
      <p v-else class="text-sm text-text-gray-light">No items to display.</p>
    </ModalDialog>
  </div>
</template>
