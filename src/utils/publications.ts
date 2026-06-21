import type { Project, Publication } from "../types";
import { escapeHtml } from "./html";

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

export interface PublicationTagSummary {
  name: string;
  count: number;
}

export interface PublicationFilterOptions {
  searchQuery: string;
  selectedTag: string;
  selectedYear: string;
}

export interface FormatAuthorsOptions {
  authors?: string;
  firstAuthors?: string;
  correspondingAuthors?: string;
  authorLinks?: Record<string, string>;
}

export function getFeaturedPublications(publications: Publication[]) {
  return publications.filter((publication) => publication.featured);
}

export function getPublicationYears(publications: Publication[]) {
  return [
    ...new Set(
      publications.map((publication) => publication.year).filter(Boolean),
    ),
  ].sort((a, b) => b.localeCompare(a));
}

export function getPublicationTags(publications: Publication[]) {
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
    .map(([name, count]): PublicationTagSummary => ({ name, count }))
    .sort(comparePublicationTags);
}

export function filterPublications(
  publications: Publication[],
  featuredPublications: Publication[],
  { searchQuery, selectedTag, selectedYear }: PublicationFilterOptions,
) {
  const query = searchQuery.trim().toLowerCase();
  const base =
    selectedTag === "All"
      ? publications
      : selectedTag
        ? publications.filter((publication) => publication.tag === selectedTag)
        : featuredPublications;

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
      (!selectedYear || publication.year === selectedYear)
    );
  });
}

export function getActivePublicationFilterLabel(selectedTag: string) {
  if (selectedTag === "") {
    return "Featured";
  }

  if (selectedTag === "All") {
    return "All";
  }

  return selectedTag;
}

export function formatAuthorsHtml({
  authors = "",
  firstAuthors = "",
  correspondingAuthors = "",
  authorLinks = {},
}: FormatAuthorsOptions) {
  const firstAuthorList = splitAuthorList(firstAuthors);
  const correspondingAuthorList = splitAuthorList(correspondingAuthors);
  const hasCoFirstAuthors = firstAuthorList.length > 1;

  return splitAuthorList(authors)
    .map((author) => {
      let formattedAuthor = escapeHtml(author);

      if (author === "Yinghao Zhu") {
        formattedAuthor = `<strong class="author-highlight">${formattedAuthor}</strong>`;
      } else if (authorLinks[author]) {
        formattedAuthor = `<a href="${escapeHtml(authorLinks[author])}" target="_blank" rel="noopener noreferrer" class="author-link">${formattedAuthor}</a>`;
      }

      if (hasCoFirstAuthors && firstAuthorList.includes(author)) {
        formattedAuthor +=
          '<sup class="text-text-gray-light font-bold">*</sup>';
      }

      if (correspondingAuthorList.includes(author)) {
        formattedAuthor +=
          '<sup class="text-text-gray-light font-bold">†</sup>';
      }

      return formattedAuthor;
    })
    .join(", ");
}

export function getPublicationAuthorFields(item: Publication | Project) {
  return "firstAuthors" in item
    ? {
        firstAuthors: item.firstAuthors,
        correspondingAuthors: item.correspondingAuthors,
      }
    : {
        firstAuthors: "",
        correspondingAuthors: "",
      };
}

function splitAuthorList(value = "") {
  return value
    .split(/,\s*/)
    .map((author) => author.trim())
    .filter(Boolean);
}

function comparePublicationTags(
  a: PublicationTagSummary,
  b: PublicationTagSummary,
) {
  if (a.name === "Other Topics") return 1;
  if (b.name === "Other Topics") return -1;

  const indexA = publicationTagOrder.indexOf(a.name);
  const indexB = publicationTagOrder.indexOf(b.name);

  if (indexA !== -1 && indexB !== -1) return indexA - indexB;
  if (indexA !== -1) return -1;
  if (indexB !== -1) return 1;

  return b.count - a.count;
}
