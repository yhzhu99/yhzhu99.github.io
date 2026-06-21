import type { LinkItem, ServiceItem } from "../types";

const htmlEscapes: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export const reviewerPreview = [
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

export const publicationTagOrder = [
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

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

export function formatAuthors(
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

export function latestYear(value = "") {
  const years = value.match(/\d{4}/g);
  return years ? Math.max(...years.map(Number)) : 0;
}

export function venuePriority(venue = "") {
  const venueLower = venue.toLowerCase();

  if (venueLower.includes("arxiv") || venueLower.includes("preprint")) {
    return 4;
  }

  if (
    venueLower.includes("abstract") ||
    venueLower.includes("poster") ||
    venueLower.includes("demo") ||
    venueLower.includes("nominee")
  ) {
    return 3;
  }

  if (
    venueLower.includes("workshop") ||
    venueLower.includes("symposium") ||
    venueLower.includes("summit")
  ) {
    return 2;
  }

  return 1;
}

export function isPublished(venue = "") {
  const venueLower = venue.toLowerCase();
  return !venueLower.includes("arxiv") && !venueLower.includes("preprint");
}

export function formatServiceItemContent(item: Partial<ServiceItem>) {
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
      ? `<br><small class="text-gray-400 mt-1">Team: ${authors}</small>`
      : "",
    links,
  ].join("");
}

function splitAuthorList(value: string) {
  return value
    .split(/,\s*/)
    .map((author) => author.trim())
    .filter(Boolean);
}

function formatLinks(links: LinkItem[]) {
  if (!links.length) {
    return "";
  }

  const html = links
    .map(
      (link) =>
        `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="inline-flex px-2 py-0.5 bg-bg-secondary text-text-gray text-xs rounded-full hover:bg-primary-blue/10 hover:text-primary-blue-dark transition-colors">${escapeHtml(link.type)}</a>`,
    )
    .join(" ");

  return `<div class="mt-2 flex flex-wrap gap-1.5">${html}</div>`;
}
