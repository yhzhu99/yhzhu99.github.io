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
import ThemeToggle from "../components/ThemeToggle.vue";
import TimelineColumn from "../components/TimelineColumn.vue";
import { siteData } from "../utils/site-data";
import { escapeHtml } from "../utils/html";
import {
  filterPublications,
  getActivePublicationFilterLabel,
  getFeaturedPublications,
  getPublicationTags,
  getPublicationYears,
} from "../utils/publications";
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

const cvUrl = "/YinghaoZhu_CV.pdf";

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

const {
  authorLinks,
  awards,
  education,
  experience,
  grants,
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
  getFeaturedPublications(publications),
);

const availableYears = computed(() => getPublicationYears(publications));

const publicationTags = computed(() => getPublicationTags(publications));

const filteredPublications = computed(() =>
  filterPublications(publications, featuredPublications.value, {
    searchQuery: searchQuery.value,
    selectedTag: selectedTag.value,
    selectedYear: selectedYear.value,
  }),
);

const activePublicationFilterLabel = computed(() =>
  getActivePublicationFilterLabel(selectedTag.value),
);

function selectTab(tabId: TabId) {
  activeTab.value = tabId;
  nextTick(() => {
    updateNavIndicator();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
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
  selectedTag.value = "All";
  selectTab("publications");
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
  }
}

function toAwardModalItem(item: AwardItem): ModalItem {
  return {
    uid: item.uid,
    date: item.year,
    content: formatServiceItemContent(item),
  };
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
        `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="inline-flex rounded-full bg-bg-secondary px-2 py-0.5 text-xs text-text-gray transition-colors hover:bg-primary-blue/10 hover:text-primary-blue-dark">${escapeHtml(link.type)}</a>`,
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
  <div class="app-shell bg-bg-light font-academic text-text-gray">
    <header
      class="sticky top-0 z-50 flex-shrink-0 border-b border-slate-200/70 bg-surface/90 backdrop-blur-md transition-all duration-300"
    >
      <div class="mx-auto max-w-screen-2xl px-3 py-1.5 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between gap-2">
          <button
            type="button"
            class="flex min-w-0 items-center gap-2 rounded-sm text-left transition-opacity hover:opacity-80 sm:gap-3"
            aria-label="Show About section"
            @click="selectTab('about')"
          >
            <span
              class="h-5 w-1 flex-shrink-0 rounded-full bg-primary-blue sm:h-6"
              aria-hidden="true"
            />
            <span
              class="truncate text-base font-bold tracking-tight text-text-gray sm:text-lg md:text-xl"
            >
              Yinghao Zhu
            </span>
            <span
              class="flex-shrink-0 text-sm text-text-gray-light sm:text-lg md:text-xl"
              >{{ profile.cnName }}</span
            >
            <img
              src="/assets/hku-crest.svg"
              alt="HKU Logo"
              class="h-7 w-auto flex-shrink-0 opacity-80 transition-opacity hover:opacity-100 sm:h-9"
            />
          </button>

          <nav
            ref="desktopNav"
            aria-label="Primary navigation"
            class="relative hidden items-center gap-1 rounded-full bg-slate-900/[0.04] p-1 text-sm font-medium ring-1 ring-inset ring-slate-900/5 md:flex"
          >
            <span
              aria-hidden="true"
              class="pointer-events-none absolute bottom-1 left-0 top-1 rounded-full bg-surface shadow-soft ring-1 ring-slate-900/5"
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

          <div class="flex flex-shrink-0 items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        <nav
          id="mobile-navigation"
          aria-label="Mobile section navigation"
          class="no-scrollbar -mx-3 mt-1.5 flex items-center gap-1.5 overflow-x-auto border-t border-slate-200/60 px-3 pt-1.5 pb-0.5 md:hidden"
        >
          <button
            v-for="tab in tabs"
            :key="`mobile-${tab.id}`"
            type="button"
            class="flex-1 flex-shrink-0 rounded-full px-3 py-1.5 text-center text-xs font-medium whitespace-nowrap transition-colors"
            :class="
              activeTab === tab.id
                ? 'bg-primary-blue text-white shadow-soft'
                : 'bg-slate-900/[0.04] text-text-gray-light hover:bg-slate-900/[0.08] hover:text-text-gray'
            "
            :aria-current="activeTab === tab.id ? 'page' : undefined"
            @click="selectTab(tab.id)"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <div
        class="app-main-container mx-auto max-w-screen-2xl px-3 py-3 sm:px-6 sm:py-4 lg:px-8"
      >
        <div class="app-main-grid">
          <aside class="app-sidebar">
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
                <div class="grid grid-cols-2 gap-2">
                  <a
                    :href="cvUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="interactive-element flex min-w-0 items-center justify-between rounded-md border border-primary-blue/15 bg-primary-blue/[0.04] px-3 py-2 text-xs font-semibold text-primary-blue-dark hover:border-primary-blue/30 hover:bg-primary-blue/10"
                    aria-label="Open CV PDF"
                  >
                    <span>CV</span>
                    <svg
                      class="h-3.5 w-3.5 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path
                        d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
                      />
                      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                      <path d="M10 9H8" />
                      <path d="M16 13H8" />
                      <path d="M16 17H8" />
                    </svg>
                  </a>
                  <RouterLink
                    to="/world"
                    class="interactive-element flex min-w-0 items-center justify-between rounded-md border border-primary-blue/15 bg-primary-blue/[0.04] px-3 py-2 text-xs font-semibold text-primary-blue-dark hover:border-primary-blue/30 hover:bg-primary-blue/10"
                    aria-label="Open 3D workspace"
                  >
                    <span>3D Workspace</span>
                    <svg
                      class="h-3.5 w-3.5 flex-shrink-0"
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

          <section class="academic-card app-content-card rounded-lg">
            <div
              v-show="activeTab === 'about'"
              class="panel-pane scrollable-container animate-scale-in flex min-w-0 flex-col p-3.5 sm:p-5 lg:p-6"
            >
              <div class="mobile-only-block mb-6 space-y-3">
                <div
                  class="rounded-lg border border-slate-200/80 bg-slate-50/40 p-3.5 sm:p-4"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0 flex-1">
                      <h2
                        class="flex flex-wrap items-baseline gap-2 text-lg font-bold tracking-tight text-text-gray sm:text-xl"
                      >
                        <span>{{ profile.name }}</span>
                        <span class="text-base font-normal text-text-gray-light">
                          {{ profile.cnName }}
                        </span>
                      </h2>
                      <a
                        :href="`mailto:${profile.email}`"
                        class="profile-contact mt-1.5 flex items-center gap-2 text-xs text-text-gray-light transition-colors hover:text-primary-blue sm:text-sm"
                      >
                        <svg
                          class="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4"
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
                      <p
                        class="mt-1 text-xs font-medium text-text-gray-light sm:text-sm"
                      >
                        {{ profile.affiliation }}
                      </p>
                    </div>
                    <img
                      :src="profile.photo"
                      :alt="profile.name"
                      class="avatar-ring h-16 w-16 flex-shrink-0 rounded-full object-cover sm:h-18 sm:w-18"
                    />
                  </div>
                  <div class="mt-3 grid grid-cols-2 gap-2">
                    <a
                      :href="cvUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="interactive-element flex min-w-0 items-center justify-between rounded-md border border-primary-blue/15 bg-primary-blue/[0.04] px-3 py-2 text-xs font-semibold text-primary-blue-dark hover:border-primary-blue/30 hover:bg-primary-blue/10 sm:text-sm"
                      aria-label="Open CV PDF"
                    >
                      <span>CV</span>
                      <svg
                        class="h-4 w-4 flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                      >
                        <path
                          d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
                        />
                        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                        <path d="M10 9H8" />
                        <path d="M16 13H8" />
                        <path d="M16 17H8" />
                      </svg>
                    </a>
                    <RouterLink
                      to="/world"
                      class="interactive-element flex min-w-0 items-center justify-between rounded-md border border-primary-blue/15 bg-primary-blue/[0.04] px-3 py-2 text-xs font-semibold text-primary-blue-dark hover:border-primary-blue/30 hover:bg-primary-blue/10 sm:text-sm"
                      aria-label="Open 3D workspace"
                    >
                      <span>3D Workspace</span>
                      <svg
                        class="h-4 w-4 flex-shrink-0"
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
                </div>

                <QuickLinks :links="quickLinks" :icons="quickLinkIcons" />

                <div
                  class="rounded-lg border border-slate-200/80 bg-slate-50/40 p-3.5"
                >
                  <div
                    class="mb-2 flex items-center justify-between border-b border-slate-200 pb-2"
                  >
                    <h3
                      class="text-sm font-semibold tracking-tight text-text-gray"
                    >
                      Recent News
                    </h3>
                    <button
                      type="button"
                      class="interactive-element inline-flex items-center gap-1 rounded-full border border-slate-200 bg-surface px-2.5 py-1 text-xs font-medium text-text-gray-light hover:border-primary-blue/40 hover:bg-primary-blue/5 hover:text-primary-blue"
                      aria-label="View all news"
                      @click="showNewsModal = true"
                    >
                      <span>All ({{ newsItems.length }})</span>
                      <svg
                        class="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                      >
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </svg>
                    </button>
                  </div>
                  <NewsList :items="newsItems" :limit="4" />
                </div>
              </div>

              <div class="prose prose-sm max-w-none">
                <p
                  class="bio mb-4 text-sm leading-[1.6] text-text-gray"
                  v-html="profile.bio"
                />
                <div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
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
                  class="featured-publications-section flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5"
                >
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <h4
                      class="text-base font-semibold tracking-tight text-text-gray sm:text-lg"
                    >
                      Featured Publications
                    </h4>
                    <div
                      class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-gray-light"
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
                    class="interactive-element inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-surface px-3 py-1 text-xs font-medium text-text-gray-light hover:border-primary-blue/40 hover:bg-primary-blue/5 hover:text-primary-blue"
                    aria-label="View all publications"
                    @click="openAllPublications"
                  >
                    <span>All ({{ publications.length }})</span>
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
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="featured-publications-section pt-3">
                <div class="space-y-2">
                  <PublicationCard
                    v-for="publication in featuredPublications"
                    :key="publication.uid"
                    :item="publication"
                    :author-links="authorLinks"
                    show-tag
                  />
                </div>
                <div class="mt-4 flex justify-center">
                  <button
                    type="button"
                    class="interactive-element inline-flex items-center gap-1.5 rounded-full border border-primary-blue/20 bg-primary-blue/[0.04] px-4 py-2 text-xs font-semibold text-primary-blue-dark hover:border-primary-blue/35 hover:bg-primary-blue/10"
                    @click="openAllPublications"
                  >
                    <span
                      >Explore all {{ publications.length }} publications</span
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
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div
              v-show="activeTab === 'publications'"
              class="publications-pane animate-scale-in flex flex-col"
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
                          class="filter-toggle interactive-element ml-auto inline-flex items-center gap-1.5 rounded-full border border-primary-blue/15 bg-surface px-3 py-1.5 text-xs font-medium text-text-gray-light shadow-soft hover:border-primary-blue/30 hover:bg-primary-blue/5 hover:text-primary-blue-dark"
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
                        <div class="flex flex-wrap items-center gap-3">
                          <div
                            class="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] gap-2"
                          >
                            <input
                              v-model="searchQuery"
                              type="text"
                              placeholder="Search publications..."
                              class="filter-control min-w-0 rounded-md border border-slate-200 bg-surface px-3 py-1.5 text-sm transition-all focus:border-primary-blue focus:ring-1 focus:ring-primary-blue sm:py-2"
                            />
                            <select
                              v-model="selectedYear"
                              aria-label="Filter by publication year"
                              class="filter-control rounded-md border border-slate-200 bg-surface px-2.5 py-1.5 text-sm transition-all focus:border-primary-blue focus:ring-1 focus:ring-primary-blue sm:px-3 sm:py-2"
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
                            class="hidden shrink-0 text-xs text-text-gray-light sm:flex sm:items-center sm:gap-4"
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

                        <div
                          class="no-scrollbar -mx-1 mt-2.5 flex items-center gap-1.5 overflow-x-auto px-1 pb-0.5 sm:mx-0 sm:mt-3 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
                        >
                          <button
                            type="button"
                            class="publication-filter-tab"
                            :class="
                              selectedTag === ''
                                ? 'bg-primary-blue text-white'
                                : 'bg-surface text-text-gray ring-1 ring-inset ring-slate-900/5 hover:bg-primary-blue/10'
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
                                : 'bg-surface text-text-gray ring-1 ring-inset ring-slate-900/5 hover:bg-primary-blue/10'
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
                                : 'bg-surface text-text-gray ring-1 ring-inset ring-slate-900/5 hover:bg-primary-blue/10'
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
                            class="filter-toggle interactive-element ml-auto hidden items-center gap-1.5 rounded-full border border-slate-200 bg-surface px-3 py-1.5 text-xs font-medium text-text-gray-light hover:border-primary-blue/30 hover:bg-primary-blue/5 hover:text-primary-blue-dark sm:inline-flex"
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
                          class="mt-2 flex items-center justify-between gap-2 text-xs text-text-gray-light sm:hidden"
                        >
                          <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                            <span
                              ><sup class="font-bold">*</sup> Co-first
                              author</span
                            >
                            <span
                              ><sup class="font-bold">†</sup> Corresponding
                              author</span
                            >
                          </div>
                          <button
                            type="button"
                            class="filter-toggle interactive-element inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-surface px-2.5 py-1 text-xs font-medium text-text-gray-light hover:border-primary-blue/30 hover:bg-primary-blue/5 hover:text-primary-blue-dark"
                            aria-expanded="true"
                            @click="setFilterExpanded(false)"
                          >
                            <svg
                              class="h-3 w-3"
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="publications-list-pane scrollable-container p-3.5 pt-2 sm:p-5 sm:pt-2 lg:p-6 lg:pt-2"
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
              class="panel-pane scrollable-container animate-scale-in flex-1 p-3.5 sm:p-5 lg:p-6"
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
              class="panel-pane scrollable-container animate-scale-in flex-1 p-3.5 sm:p-5 lg:p-6"
            >
              <div
                class="grid grid-cols-1 gap-6 border-b border-slate-200 pb-4 lg:grid-cols-2 lg:gap-4"
              >
                <section>
                  <div
                    class="mb-3 flex items-center justify-between border-b border-slate-200 px-1 pb-2 sm:px-2"
                  >
                    <h3
                      class="text-lg font-semibold tracking-tight text-text-gray"
                    >
                      Awards & Honors
                    </h3>
                    <button
                      type="button"
                      class="interactive-element inline-flex items-center gap-1 rounded-full border border-slate-200 bg-surface px-2.5 py-1 text-xs font-medium text-text-gray-light hover:border-primary-blue/40 hover:bg-primary-blue/5 hover:text-primary-blue"
                      aria-label="View all awards and honors"
                      @click="openServiceModal('Awards & Honors')"
                    >
                      <span>All ({{ awards.length }})</span>
                      <svg
                        class="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                      >
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </svg>
                    </button>
                  </div>
                  <div
                    class="scrollable-container pr-1 lg:mask-fade-bottom lg:max-h-[30vh] lg:overflow-y-auto"
                  >
                    <article
                      v-for="award in awards"
                      :key="award.uid"
                      class="unified-item rounded px-1 transition-colors hover:bg-slate-50 sm:px-2"
                    >
                      <div class="unified-item-content">
                        <h4 class="mb-0.5 text-xs font-semibold text-text-gray">
                          {{ award.title }}
                        </h4>
                        <p class="text-xs text-text-gray-light">
                          {{ award.organization }}
                        </p>
                        <p
                          v-if="award.authors"
                          class="mt-0.5 text-[11px] text-text-gray-light/80"
                        >
                          Team: {{ award.authors }}
                        </p>
                        <div
                          v-if="award.links?.length"
                          class="mt-1.5 flex flex-wrap gap-1.5"
                        >
                          <a
                            v-for="link in award.links"
                            :key="`${award.uid}-${link.type}`"
                            :href="link.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="inline-flex rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-text-gray-light ring-1 ring-inset ring-slate-900/5 transition-colors hover:bg-primary-blue/10 hover:text-primary-blue-dark"
                          >
                            {{ link.type }}
                          </a>
                        </div>
                      </div>
                      <span class="time-tag">{{ award.year }}</span>
                    </article>
                  </div>
                </section>

                <section>
                  <div
                    class="mb-3 flex items-center justify-between border-b border-slate-200 px-1 pb-2 sm:px-2"
                  >
                    <h3
                      class="text-lg font-semibold tracking-tight text-text-gray"
                    >
                      Talks & Interviews
                    </h3>
                    <button
                      type="button"
                      class="interactive-element inline-flex items-center gap-1 rounded-full border border-slate-200 bg-surface px-2.5 py-1 text-xs font-medium text-text-gray-light hover:border-primary-blue/40 hover:bg-primary-blue/5 hover:text-primary-blue"
                      aria-label="View all talks and interviews"
                      @click="openServiceModal('Talks & Interviews')"
                    >
                      <span>All ({{ talks.length }})</span>
                      <svg
                        class="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                      >
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </svg>
                    </button>
                  </div>
                  <div
                    class="scrollable-container pr-1 lg:mask-fade-bottom lg:max-h-[30vh] lg:overflow-y-auto"
                  >
                    <article
                      v-for="talk in talks"
                      :key="talk.uid"
                      class="unified-item rounded px-1 transition-colors hover:bg-slate-50 sm:px-2"
                    >
                      <div class="unified-item-content">
                        <h4 class="mb-0.5 text-xs font-semibold text-text-gray">
                          {{ talk.title }}
                        </h4>
                        <p class="text-xs text-text-gray-light">
                          {{ talk.venue }}
                        </p>
                        <div
                          v-if="talk.links?.length"
                          class="mt-1.5 flex flex-wrap gap-1.5"
                        >
                          <a
                            v-for="link in talk.links"
                            :key="`${talk.uid}-${link.type}`"
                            :href="link.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="inline-flex rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-text-gray-light ring-1 ring-inset ring-slate-900/5 transition-colors hover:bg-primary-blue/10 hover:text-primary-blue-dark"
                          >
                            {{ link.type }}
                          </a>
                        </div>
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
                  Grants
                </h3>
                <div class="space-y-2">
                  <article
                    v-for="grant in grants"
                    :key="grant.uid"
                    class="publication-card"
                  >
                    <div class="min-w-0 flex-1">
                      <h4
                        class="mb-1 text-sm font-semibold leading-tight text-text-gray"
                      >
                        {{ grant.title }}
                      </h4>
                      <p class="text-xs italic text-primary-blue">
                        {{ grant.program }}
                      </p>
                      <p class="mt-1 text-xs text-text-gray-light">
                        {{ grant.role }} · {{ grant.amount }}
                      </p>
                    </div>
                    <span
                      class="time-tag order-first self-start sm:order-none sm:self-auto"
                      >{{ grant.year }}</span
                    >
                  </article>
                </div>
              </section>

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
