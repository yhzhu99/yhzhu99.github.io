import { authorLinks } from "./authors";
import { awards } from "./awards";
import { education } from "./education";
import { experience } from "./experience";
import { quickLinkIcons, quickLinks } from "./links";
import { newsItems } from "./news";
import { profile } from "./profile";
import { projects } from "./projects";
import { publications } from "./publications";
import { services } from "./services";
import { talks } from "./talks";
import type {
  AwardItem,
  NewsItem,
  Project,
  Publication,
  ServiceGroup,
  ServiceItem,
  SiteData,
  TimelineItem,
} from "../types";

const withUid = <T extends Record<string, unknown>>(
  items: readonly T[],
  prefix: string,
) => items.map((item, index) => ({ ...item, uid: `${prefix}-${index + 1}` }));

const getLatestServiceYear = (year: unknown) => {
  const years = String(year ?? "").match(/\b\d{4}\b/g)?.map(Number) ?? [];

  return years.length > 0 ? Math.max(...years) : Number.NEGATIVE_INFINITY;
};

const sortReviewerItems = (items: readonly Record<string, unknown>[]) =>
  items.slice().sort((a, b) => {
    const yearDifference = getLatestServiceYear(b.year) - getLatestServiceYear(a.year);

    if (yearDifference !== 0) {
      return yearDifference;
    }

    return String(a.content ?? "").localeCompare(String(b.content ?? ""), "en", {
      sensitivity: "base",
    });
  });

const getServiceItems = (group: Record<string, unknown>) => {
  const items = (group.items as readonly Record<string, unknown>[] | undefined) ?? [];

  return group.title === "Reviewer" ? sortReviewerItems(items) : items;
};

const withNestedServiceUids = (
  groups: readonly Record<string, unknown>[],
): ServiceGroup[] =>
  groups.map((group, groupIndex) => ({
    ...(group as Omit<ServiceGroup, "uid" | "items">),
    uid: `service-${groupIndex + 1}`,
    items: withUid(
      getServiceItems(group),
      `service-${groupIndex + 1}-item`,
    ) as unknown as ServiceItem[],
  }));

export const siteData: SiteData = {
  profile,
  authorLinks,
  newsItems: withUid(newsItems, "news") as NewsItem[],
  quickLinks,
  quickLinkIcons,
  publications: withUid(publications, "publication") as Publication[],
  projects: withUid(projects, "project") as Project[],
  education: withUid(education, "education") as TimelineItem[],
  experience: withUid(experience, "experience") as TimelineItem[],
  awards: withUid(awards, "award") as AwardItem[],
  talks: withUid(talks, "talk") as AwardItem[],
  services: withNestedServiceUids(services),
};

export {
  authorLinks,
  awards,
  education,
  experience,
  profile,
  projects,
  publications,
  quickLinkIcons,
  quickLinks,
  services,
  talks,
};
