export type TabId = "about" | "publications" | "experience" | "awards";

export interface TabItem {
  id: TabId;
  name: string;
}

export interface LinkItem {
  type: string;
  url: string;
}

export interface QuickLink {
  name: string;
  url: string;
}

export interface Interest {
  uid: string;
  title: string;
  description?: string;
  desc?: string;
}

export interface Profile {
  name: string;
  cnName: string;
  title: string;
  role: string;
  affiliation: string;
  school: string;
  email: string;
  photo: string;
  bio: string;
  interests: Interest[];
  workspace: {
    title: string;
    location: string;
    description: string;
  };
}

export interface NewsItem {
  uid: string;
  date: string;
  content: string;
}

export interface Publication {
  uid: string;
  featured?: boolean;
  title: string;
  authors: string;
  firstAuthors?: string;
  correspondingAuthors?: string;
  venue: string;
  year: string;
  tag?: string;
  links: LinkItem[];
}

export interface Project {
  uid: string;
  title: string;
  authors: string;
  venue?: string;
  year: string;
  links: LinkItem[];
}

export interface TimelineItem {
  uid: string;
  institution?: string;
  organization?: string;
  degree?: string;
  position?: string;
  location?: string;
  period?: string;
  details?: string;
}

export interface AwardItem {
  uid: string;
  title: string;
  organization?: string;
  venue?: string;
  year: string;
  authors?: string;
  links?: LinkItem[];
}

export interface ServiceItem {
  uid: string;
  year: string;
  content: string;
  title?: string;
  organization?: string;
  venue?: string;
  authors?: string;
  links?: LinkItem[];
}

export interface ServiceGroup {
  uid: string;
  title: string;
  items: ServiceItem[];
}

export interface ModalItem {
  uid: string;
  date: string;
  content: string;
}

export interface ServiceModalState {
  title: string;
  items: ModalItem[];
}

export interface SiteData {
  authorLinks: Record<string, string>;
  newsItems: NewsItem[];
  quickLinks: QuickLink[];
  quickLinkIcons: Record<string, string>;
  publications: Publication[];
  projects: Project[];
  education: TimelineItem[];
  experience: TimelineItem[];
  awards: AwardItem[];
  talks: AwardItem[];
  services: ServiceGroup[];
}
