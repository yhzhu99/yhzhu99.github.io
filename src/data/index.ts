import { authorLinks } from "./authors";
import { awards } from "./awards";
import { education } from "./education";
import { experience } from "./experience";
import { quickLinkIcons, quickLinks } from "./links";
import { newsItems } from "./news";
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

const withNestedServiceUids = (
  groups: readonly Record<string, unknown>[],
): ServiceGroup[] =>
  groups.map((group, groupIndex) => ({
    ...(group as Omit<ServiceGroup, "uid" | "items">),
    uid: `service-${groupIndex + 1}`,
    items: withUid(
      (group.items as readonly Record<string, unknown>[] | undefined) ?? [],
      `service-${groupIndex + 1}-item`,
    ) as unknown as ServiceItem[],
}));

export const siteData: SiteData = {
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
  projects,
  publications,
  quickLinkIcons,
  quickLinks,
  services,
  talks,
};
