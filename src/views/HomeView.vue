<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { RouterLink } from "vue-router";
import ModalDialog from "../components/ModalDialog.vue";
import NewsList from "../components/NewsList.vue";
import PublicationCard from "../components/PublicationCard.vue";
import QuickLinks from "../components/QuickLinks.vue";
import TimelineColumn from "../components/TimelineColumn.vue";
import { siteData } from "../data";
import type {
  AwardItem,
  LinkItem,
  ModalItem,
  ServiceModalState,
  ServiceItem,
  TabId,
  TabItem,
} from "../types";

const tabs = [
  { name: "About", id: "about" },
  { name: "Publications", id: "publications" },
  { name: "Experience", id: "experience" },
  { name: "Honors & Service", id: "awards" },
] satisfies TabItem[];

const reviewerPreview = [
  "npj Digital Medicine",
  "NeurIPS",
  "ICML",
  "ICLR",
  "KDD",
  "WWW",
  "AAAI",
  "CHI",
  "UIST",
  "AMIA",
];

const publicationTagOrder = [
  "LLM Agents for Healthcare",
  "LLM for Healthcare",
  "Healthcare Benchmark",
  "Healthcare Modeling",
  "Trustworthy AI",
  "Software Engineering",
  "Toolkits & Platforms",
  "Survey",
  "Book Chapters",
];

const htmlEscapes: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const {
  authorLinks,
  awards,
  education,
  experience,
  newsItems,
  profile,
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
const filterPanelContent = ref<HTMLElement | null>(null);
const filterAnimating = ref(false);
const navIndicatorStyle = ref("");
const navIndicatorReady = ref(false);
let resizeObserver: ResizeObserver | null = null;
let filterAnimationFrame = 0;
let filterAnimationTimeout = 0;

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

  return [...base].filter((publication) => {
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
  });
});

const activePublicationFilterLabel = computed(() => {
  if (selectedTag.value === "") {
    return "Featured";
  }

  if (selectedTag.value === "All") {
    return "All";
  }

  return selectedTag.value;
});

function selectTab(tabId: TabId) {
  activeTab.value = tabId;
  showMobileNav.value = false;
  nextTick(updateNavIndicator);
}

function selectPublicationTag(tag: string) {
  selectedTag.value = selectedTag.value === tag ? "All" : tag;
}

function setFilterExpanded(expanded: boolean) {
  if (filterExpanded.value === expanded) {
    return;
  }

  const panel = filterPanelContent.value;

  if (!panel) {
    filterExpanded.value = expanded;
    return;
  }

  const startHeight = panel.offsetHeight;
  panel.style.height = `${startHeight}px`;
  panel.style.overflow = "hidden";
  filterAnimating.value = true;
  filterExpanded.value = expanded;

  nextTick(() => {
    const targetHeight =
      panel.firstElementChild?.getBoundingClientRect().height ??
      panel.scrollHeight;
    cancelAnimationFrame(filterAnimationFrame);
    window.clearTimeout(filterAnimationTimeout);

    filterAnimationFrame = requestAnimationFrame(() => {
      panel.style.height = `${targetHeight}px`;
    });

    filterAnimationTimeout = window.setTimeout(() => {
      panel.style.height = "";
      panel.style.overflow = "";
      filterAnimating.value = false;
    }, 280);
  });
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
    items: (service?.items ?? []).slice().map(
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

function toAwardModalItem(item: AwardItem): ModalItem {
  return {
    uid: item.uid,
    date: item.year,
    content: formatServiceItemContent(item),
  };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

function formatServiceItemContent(item: Partial<ServiceItem>) {
  if (item.content && !item.title) {
    return escapeHtml(item.content);
  }

  const title = escapeHtml(item.title ?? item.content ?? "");
  const subtext = escapeHtml(item.organization ?? item.venue ?? "");
  const authors = item.authors ? escapeHtml(item.authors) : "";
  const links = formatLinks(item.links ?? []);

  return [
    title,
    subtext ? `<br><small class="text-gray-500">${subtext}</small>` : "",
    authors
      ? `<br><small class="mt-1 text-gray-400">Team: ${authors}</small>`
      : "",
    links,
  ].join("");
}

function formatLinks(links: LinkItem[]) {
  if (!links.length) {
    return "";
  }

  const html = links
    .map(
      (link) =>
        `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="inline-flex rounded-full bg-bg-secondary px-2 py-0.5 text-xs text-text-gray transition-colors hover:bg-primary-blue/10 hover:text-primary-blue-dark">${escapeHtml(link.type)}</a>`,
    )
    .join(" ");

  return `<div class="mt-2 flex flex-wrap gap-1.5">${html}</div>`;
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
  cancelAnimationFrame(filterAnimationFrame);
  window.clearTimeout(filterAnimationTimeout);
});

watch(activeTab, () => {
  nextTick(updateNavIndicator);
});
</script>

<template>
  <div
    class="grid h-dvh grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-bg-light font-academic text-text-gray"
  >
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
              src="/assets/hku-logo.jpg"
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

    <main class="min-h-0 overflow-hidden">
      <div
        class="mx-auto h-full min-h-0 max-w-screen-2xl px-4 py-4 sm:px-6 lg:px-8"
      >
        <div
          class="grid h-full min-h-0 min-w-0 grid-cols-1 grid-rows-[minmax(0,1fr)] gap-4 lg:grid-cols-4"
        >
          <aside class="hidden min-h-0 flex-col gap-4 overflow-hidden lg:flex">
            <section
              class="academic-card interactive-element flex-shrink-0 rounded-lg p-4"
            >
              <div class="space-y-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <h2 class="text-lg font-bold tracking-tight text-text-gray">
                      {{ profile.name }}
                    </h2>
                    <a
                      :href="`mailto:${profile.email}`"
                      class="profile-contact mt-1.5 flex items-center gap-2 text-xs text-text-gray-light transition-colors hover:text-primary-blue"
                    >
                      <svg
                        class="h-3.5 w-3.5 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0 0 16 4H4a2 2 0 0 0-1.997 1.884z"
                        />
                        <path
                          d="m18 8.118-8 4-8-4V14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.118z"
                        />
                      </svg>
                      <span>{{ profile.email }}</span>
                    </a>
                    <p class="mt-1 text-xs font-medium text-text-gray-light">
                      {{ profile.affiliation }}
                    </p>
                  </div>
                  <img
                    :src="profile.photo"
                    :alt="profile.name"
                    class="avatar-ring h-16 w-16 flex-shrink-0 rounded-full object-cover"
                  />
                </div>
                <RouterLink
                  to="/world"
                  class="interactive-element flex w-full items-center justify-between rounded-md border border-primary-blue/15 bg-primary-blue/[0.04] px-3 py-2 text-xs font-semibold text-primary-blue-dark hover:border-primary-blue/30 hover:bg-primary-blue/10"
                  aria-label="Open 3D workspace"
                >
                  <span>3D Workspace</span>
                  <svg
                    class="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M7 17 17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </RouterLink>
              </div>
            </section>

            <section
              class="academic-card interactive-element flex-shrink-0 rounded-lg p-3"
            >
              <h3
                class="mb-3 border-b border-slate-200 pb-2 text-sm font-semibold tracking-tight text-text-gray"
              >
                Quick Links
              </h3>
              <QuickLinks :links="quickLinks" :icons="quickLinkIcons" />
            </section>

            <section
              class="academic-card interactive-element flex min-h-0 flex-1 flex-col rounded-lg p-3"
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
            class="academic-card col-span-1 flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-lg lg:col-span-3"
          >
            <div
              v-show="activeTab === 'about'"
              class="panel-pane scrollable-container animate-scale-in flex h-full min-h-0 min-w-0 flex-col overflow-y-auto p-4 lg:p-6"
            >
              <div class="mb-6 lg:hidden">
                <div
                  class="mb-4 rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0 flex-1">
                      <h2
                        class="text-xl font-bold tracking-tight text-text-gray"
                      >
                        {{ profile.name }}
                      </h2>
                      <a
                        :href="`mailto:${profile.email}`"
                        class="profile-contact mt-2 flex items-center gap-2 text-sm text-text-gray-light transition-colors hover:text-primary-blue"
                      >
                        <svg
                          class="h-4 w-4 flex-shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0 0 16 4H4a2 2 0 0 0-1.997 1.884z"
                          />
                          <path
                            d="m18 8.118-8 4-8-4V14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.118z"
                          />
                        </svg>
                        <span>{{ profile.email }}</span>
                      </a>
                      <p class="mt-1 text-sm font-medium text-text-gray-light">
                        {{ profile.affiliation }}
                      </p>
                    </div>
                    <img
                      :src="profile.photo"
                      :alt="profile.name"
                      class="avatar-ring h-16 w-16 flex-shrink-0 rounded-full object-cover"
                    />
                  </div>
                  <RouterLink
                    to="/world"
                    class="interactive-element mt-3 flex w-full items-center justify-between rounded-md border border-primary-blue/15 bg-primary-blue/[0.04] px-3 py-2 text-sm font-semibold text-primary-blue-dark hover:border-primary-blue/30 hover:bg-primary-blue/10"
                    aria-label="Open 3D workspace"
                  >
                    <span>3D Workspace</span>
                    <svg
                      class="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M7 17 17 7" />
                      <path d="M7 7h10v10" />
                    </svg>
                  </RouterLink>
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
                  class="bio mb-4 leading-[1.5] text-text-gray"
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
                <div class="space-y-2">
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
              class="panel-pane animate-scale-in flex h-full min-h-0 flex-col overflow-hidden"
            >
              <div class="flex-shrink-0 border-b border-slate-200">
                <div class="px-3 py-3 lg:px-5">
                  <div
                    class="filter-panel rounded-lg border border-slate-200/80 bg-slate-50/70 p-3"
                  >
                    <div
                      ref="filterPanelContent"
                      class="filter-panel-content"
                      :class="{
                        'filter-panel-content-animating': filterAnimating,
                      }"
                    >
                      <div
                        v-if="!filterExpanded"
                        key="filter-collapsed"
                        class="filter-panel-state flex flex-wrap items-center gap-2"
                      >
                        <span class="filter-summary-chip-primary">
                          {{ activePublicationFilterLabel }}
                        </span>
                        <span v-if="selectedYear" class="filter-summary-chip">
                          {{ selectedYear }}
                        </span>
                        <span
                          v-if="searchQuery"
                          class="filter-summary-chip max-w-[18rem] truncate"
                        >
                          {{ searchQuery }}
                        </span>
                        <button
                          type="button"
                          class="filter-toggle interactive-element ml-auto inline-flex items-center gap-1.5 rounded-full border border-primary-blue/15 bg-white px-3 py-1.5 text-xs font-medium text-text-gray-light shadow-soft hover:border-primary-blue/30 hover:bg-primary-blue/5 hover:text-primary-blue-dark"
                          aria-expanded="false"
                          @click="setFilterExpanded(true)"
                        >
                          <svg
                            class="h-3.5 w-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M4 21v-7" />
                            <path d="M4 10V3" />
                            <path d="M12 21v-9" />
                            <path d="M12 8V3" />
                            <path d="M20 21v-5" />
                            <path d="M20 12V3" />
                            <path d="M2 14h4" />
                            <path d="M10 8h4" />
                            <path d="M18 16h4" />
                          </svg>
                          <span>Filters</span>
                        </button>
                      </div>

                      <div
                        v-else
                        key="filter-expanded"
                        class="filter-panel-state"
                      >
                        <div class="flex flex-wrap items-start gap-3">
                          <div
                            class="grid min-w-[min(100%,28rem)] flex-1 grid-cols-1 gap-2 sm:grid-cols-[minmax(12rem,1fr)_auto]"
                          >
                            <input
                              v-model="searchQuery"
                              type="text"
                              placeholder="Search publications..."
                              class="filter-control min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm transition-all focus:border-primary-blue focus:ring-1 focus:ring-primary-blue"
                            />
                            <select
                              v-model="selectedYear"
                              class="filter-control rounded-md border border-slate-200 bg-white px-3 py-2 text-sm transition-all focus:border-primary-blue focus:ring-1 focus:ring-primary-blue"
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
                            class="hidden shrink-0 pt-2 text-xs text-text-gray-light sm:flex sm:items-center sm:gap-4"
                          >
                            <span
                              ><sup class="font-bold">*</sup> Co-first
                              author</span
                            >
                            <span
                              ><sup class="font-bold">†</sup> Corresponding
                              author</span
                            >
                          </div>
                        </div>

                        <div class="mt-3 flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            class="publication-filter-tab"
                            :class="
                              selectedTag === ''
                                ? 'bg-primary-blue text-white'
                                : 'bg-white text-text-gray ring-1 ring-inset ring-slate-900/5 hover:bg-primary-blue/10'
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
                                : 'bg-white text-text-gray ring-1 ring-inset ring-slate-900/5 hover:bg-primary-blue/10'
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
                                : 'bg-white text-text-gray ring-1 ring-inset ring-slate-900/5 hover:bg-primary-blue/10'
                            "
                            @click="selectPublicationTag(tag.name)"
                          >
                            {{ tag.name }}
                            <span class="publication-filter-tab-count"
                              >({{ tag.count }})</span
                            >
                          </button>
                          <button
                            type="button"
                            class="filter-toggle interactive-element ml-auto inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-text-gray-light hover:border-primary-blue/30 hover:bg-primary-blue/5 hover:text-primary-blue-dark"
                            aria-expanded="true"
                            @click="setFilterExpanded(false)"
                          >
                            <svg
                              class="h-3.5 w-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                            <span>Hide</span>
                          </button>
                        </div>

                        <div
                          class="mt-2 text-xs text-text-gray-light sm:hidden"
                        >
                          <span
                            ><sup class="font-bold">*</sup> Co-first
                            author</span
                          >
                          <span
                            ><sup class="font-bold">†</sup> Corresponding
                            author</span
                          >
                        </div>
                      </div>
                    </div>
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
              class="panel-pane scrollable-container animate-scale-in h-full min-h-0 flex-1 overflow-y-auto p-4 lg:p-6"
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
              class="panel-pane scrollable-container animate-scale-in h-full min-h-0 flex-1 overflow-y-auto p-4 lg:p-6"
            >
              <div
                class="grid grid-cols-1 gap-4 border-b border-slate-200 pb-4 lg:grid-cols-2"
              >
                <section>
                  <div
                    class="mb-3 flex items-center justify-between border-b border-slate-200 px-2 pb-2"
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
                    class="scrollable-container mask-fade-bottom max-h-[30vh] overflow-y-auto pr-1"
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
                    class="mb-3 flex items-center justify-between border-b border-slate-200 px-2 pb-2"
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
                    class="scrollable-container mask-fade-bottom max-h-[30vh] overflow-y-auto pr-1"
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
      <NewsList :items="newsItems" modal />
    </ModalDialog>

    <ModalDialog
      :title="selectedService?.title ?? ''"
      :open="Boolean(selectedService)"
      @close="selectedService = null"
    >
      <div v-if="selectedService?.items.length" class="unified-list">
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
