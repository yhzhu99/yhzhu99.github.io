import {
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
} from "../data";
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
import { sortServiceItems } from "./services";

const withUid = <T extends Record<string, unknown>>(
  items: readonly T[],
  prefix: string,
) =>
  items.map((item, index) => ({ ...item, uid: `${prefix}-${index + 1}` }));

const buildServiceGroups = (
  groups: readonly Record<string, unknown>[],
): ServiceGroup[] =>
  groups.map((group, groupIndex) => {
    const groupUid = `service-${groupIndex + 1}`;
    const rawItems =
      (group.items as readonly Record<string, unknown>[] | undefined) ?? [];
    const items =
      group.title === "Reviewer" ? sortServiceItems(rawItems) : rawItems;

    return {
      ...(group as Omit<ServiceGroup, "uid" | "items">),
      uid: groupUid,
      items: withUid(items, `${groupUid}-item`) as unknown as ServiceItem[],
    };
  });

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
  services: buildServiceGroups(services),
};
