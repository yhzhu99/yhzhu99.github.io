import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type {
  AwardItem,
  LinkItem,
  Publication,
  ServiceGroup,
  TimelineItem,
} from "../src/types";
import { sortPublications } from "../src/utils/publications";
import { siteData } from "../src/utils/site-data";

const DEFAULT_OUTPUT_PATH = "build/cv/YinghaoZhu_CV.tex";
const HOMEPAGE_URL = "https://yhzhu99.github.io/";
const SCHOLAR_URL = "https://scholar.google.com/citations?user=LYrsSoEAAAAJ";

const outputPath = resolve(
  process.cwd(),
  process.argv[2] ?? DEFAULT_OUTPUT_PATH,
);

const publicationGroups = [
  {
    title: "Healthcare Benchmarks, Toolkits, and Protocols",
    tags: ["Healthcare Benchmark", "Toolkits & Platforms"],
  },
  {
    title: "Large Language Models for Healthcare",
    tags: ["LLM Agents for Healthcare", "LLM for Healthcare"],
  },
  { title: "Healthcare Modeling", tags: ["Healthcare Modeling"] },
  { title: "Trustworthy AI", tags: ["Trustworthy AI"] },
  { title: "Software Engineering", tags: ["Software Engineering"] },
  { title: "Surveys and Book Chapters", tags: ["Survey", "Book Chapters"] },
  { title: "Others", tags: ["Other Topics"] },
];

const groupedPublications = groupPublications(siteData.publications);

const cv = String.raw`\documentclass[10pt,a4paper]{article}

\usepackage[left=0.48in,right=0.48in,top=0.45in,bottom=0.48in]{geometry}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[scaled=0.92]{helvet}
\renewcommand{\familydefault}{\sfdefault}
\usepackage{microtype}
\usepackage{hyperref}
\usepackage{enumitem}
\usepackage{parskip}
\usepackage{xcolor}
\pagenumbering{gobble}

\definecolor{darkred}{RGB}{153,0,0}
\definecolor{textgray}{RGB}{55,65,81}
\definecolor{mutedgray}{RGB}{100,116,139}

\hypersetup{
    colorlinks=true,
    linkcolor=darkred,
    urlcolor=darkred,
    pdftitle={Yinghao Zhu's CV},
    pdfauthor={Yinghao Zhu},
    pageanchor=false
}
\urlstyle{same}

\newcommand{\sectiontitle}[1]{
    \vspace{2.2mm}
    {\large\textbf{#1}}
    \vspace{0.6mm}
    \hrule
    \vspace{1.4mm}
}

\newcommand{\categorytitle}[1]{
    \vspace{1.2mm}
    {\normalsize\textcolor{darkred}{\textbf{#1}}}
    \vspace{0.4mm}
}

\newcommand{\entryhead}[2]{
    \noindent
    \begin{minipage}[t]{0.82\textwidth}
    \raggedright #1
    \end{minipage}
    \hfill
    \begin{minipage}[t]{0.16\textwidth}
    \raggedleft\footnotesize\textcolor{mutedgray}{#2}
    \end{minipage}
    \par
}

\newcommand{\compactentry}[3]{
    \entryhead{#1}{#2}
    {\footnotesize #3\par}
    \vspace{0.8mm}
}

\newcommand{\pubentry}[5]{
    \noindent
    \begin{minipage}[t]{0.17\textwidth}
    \raggedright\footnotesize\textbf{#1}
    \end{minipage}
    \hfill
    \begin{minipage}[t]{0.815\textwidth}
    {\footnotesize\textbf{#2}}\\[-0.2mm]
    {\scriptsize #3}\\[-0.2mm]
    {\scriptsize\textit{#4}, #5}
    \end{minipage}
    \par\vspace{1.2mm}
}

\newenvironment{cvlist}{
  \begin{itemize}[leftmargin=1.15em,label=\textcolor{darkred}{\scriptsize$\triangleright$},topsep=0.4mm,itemsep=0.55mm,parsep=0pt]
}{
  \end{itemize}
}

\newcommand{\listentry}[3]{
    \item {\footnotesize\textbf{#1}#2\hspace{0.4em}\textcolor{mutedgray}{#3}}
}

\setlength{\parindent}{0pt}
\setlength{\parskip}{0pt}
\setlist[itemize]{leftmargin=1.1em,topsep=0.3mm,itemsep=0.35mm,parsep=0pt}
\sloppy

\begin{document}

\begin{center}
{\huge\textbf{${tex(siteData.profile.name)}}}\\[-0.2mm]
\textbf{E-mail:} \href{mailto:${href(siteData.profile.email)}}{${tex(siteData.profile.email)}}\hspace{5mm}
\textbf{Homepage:} \href{${href(HOMEPAGE_URL)}}{${tex(HOMEPAGE_URL)}}
\end{center}
\vspace{-1mm}

\sectiontitle{Research Interest}
{\footnotesize
My research focuses on \textbf{AI for Healthcare}: ${siteData.profile.interests
  .map(formatInterestPhrase)
  .join("; ")}.
\par}

\sectiontitle{Education}
${siteData.education.map(formatEducation).join("\n")}

\sectiontitle{Professional Experience}
${siteData.experience.map(formatExperience).join("\n")}

\sectiontitle{Publications \href{${href(SCHOLAR_URL)}}{\textcolor{darkred}{[Google Scholar]}} {\normalfont\small ($^{\ast}$ indicates equal contribution; $^{\dagger}$ indicates corresponding author)}}
${groupedPublications.map(formatPublicationGroup).join("\n")}

\sectiontitle{Selected Honors and Awards}
\begin{cvlist}
${siteData.awards.map(formatAward).join("\n")}
\end{cvlist}

\sectiontitle{Invited Talks}
\begin{cvlist}
${siteData.talks.map(formatTalk).join("\n")}
\end{cvlist}

\sectiontitle{Services}
${siteData.services.map(formatServiceGroup).join("\n")}

\end{document}
`;

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${cv}\n`);
  console.log(`Generated ${outputPath}`);
}

function groupPublications(publications: Publication[]) {
  const sortedPublications = sortPublications(publications);
  const groupedTags = new Set(publicationGroups.flatMap((group) => group.tags));
  const groups = publicationGroups
    .map((group) => ({
      title: group.title,
      publications: sortedPublications.filter((publication) =>
        group.tags.includes(publication.tag ?? ""),
      ),
    }))
    .filter((group) => group.publications.length > 0);

  const ungroupedPublications = sortedPublications.filter(
    (publication) => !groupedTags.has(publication.tag ?? ""),
  );

  if (ungroupedPublications.length > 0) {
    groups.push({
      title: "Additional Publications",
      publications: ungroupedPublications,
    });
  }

  return groups;
}

function formatInterestPhrase(interest: {
  title: string;
  description?: string;
  desc?: string;
}) {
  const description = interest.description ?? interest.desc ?? "";

  return description
    ? `\\textbf{${tex(interest.title)}} (${tex(description)})`
    : `\\textbf{${tex(interest.title)}}`;
}

function formatEducation(item: TimelineItem) {
  const { unit, place } = splitUnitAndPlace(item.location);
  const title = `\\textbf{${tex(item.institution)}}${formatPlace(place)}`;
  const detail = compactDetail([item.degree, unit], item.details);

  return `\\compactentry{${title}}{${tex(item.period)}}{${detail}}`;
}

function formatExperience(item: TimelineItem) {
  const { unit, place } = splitUnitAndPlace(item.location);
  const title = `\\textbf{${tex(item.organization)}}${formatPlace(place)}`;
  const detail = compactDetail([item.position, unit], item.details);

  return `\\compactentry{${title}}{${tex(item.period)}}{${detail}}`;
}

function compactDetail(parts: Array<string | undefined>, parenthetical = "") {
  const base = parts.filter(Boolean).map(tex).join(", ");
  const note = htmlToText(parenthetical);

  if (!base && !note) {
    return "";
  }

  if (!note) {
    return base;
  }

  return base ? `${base} (${tex(note)})` : `(${tex(note)})`;
}

function formatPublicationGroup(group: {
  title: string;
  publications: Publication[];
}) {
  return `\\categorytitle{${tex(group.title)}}

${group.publications.map(formatPublication).join("\n")}`;
}

function formatPublication(publication: Publication) {
  const paperUrl = getPaperUrl(publication.links);
  const title = paperUrl
    ? `\\href{${href(paperUrl)}}{${tex(publication.title)}}`
    : tex(publication.title);
  const venueShort = getVenueShort(publication.venue);
  const venue = stripYear(publication.venue, publication.year);

  return `\\pubentry{[${tex(venueShort)} ${tex(publication.year)}]}
{${title}}
{${formatAuthors(publication)}}
{${tex(venue)}}
{${tex(publication.year)}}`;
}

function formatAward(item: AwardItem) {
  const organization = item.organization
    ? `, \\textit{${tex(item.organization)}}`
    : "";

  return `\\listentry{${tex(item.title)}}{${organization}}{${tex(item.year)}}`;
}

function formatTalk(item: AwardItem) {
  const venue = item.venue ? `, \\textit{${tex(item.venue)}}` : "";

  return `\\listentry{${tex(item.title)}}{${venue}}{${tex(item.year)}}`;
}

function formatServiceGroup(group: ServiceGroup) {
  const items = group.items
    .map((item) => `\\listentry{${tex(item.content)}}{}{${tex(item.year)}}`)
    .join("\n");

  return `\\categorytitle{${tex(group.title)}}
\\begin{cvlist}
${items}
\\end{cvlist}`;
}

function splitUnitAndPlace(location = "") {
  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 2) {
    return { unit: "", place: location };
  }

  if (parts.at(-1)?.toLowerCase() === "remote") {
    return {
      unit: parts.slice(0, -1).join(", "),
      place: parts.at(-1) ?? "",
    };
  }

  return {
    unit: parts.slice(0, -2).join(", "),
    place: parts.slice(-2).join(", "),
  };
}

function formatPlace(place = "") {
  return place ? `, ${tex(place)}` : "";
}

function formatAuthors(publication: Publication) {
  const authors = splitAuthors(publication.authors);
  const firstAuthors = splitAuthors(publication.firstAuthors);
  const correspondingAuthors = splitAuthors(publication.correspondingAuthors);
  const hasCoFirstAuthors = firstAuthors.length > 1;

  return authors
    .map((author) => {
      let formatted =
        author === "Yinghao Zhu" ? `\\textbf{${tex(author)}}` : tex(author);

      if (hasCoFirstAuthors && firstAuthors.includes(author)) {
        formatted += "$^{\\ast}$";
      }

      if (correspondingAuthors.includes(author)) {
        formatted += "$^{\\dagger}$";
      }

      return formatted;
    })
    .join(", ");
}

function splitAuthors(value = "") {
  return value
    .split(/,\s*/)
    .map((author) => author.trim())
    .filter(Boolean);
}

function getPaperUrl(links: LinkItem[]) {
  return (
    links.find((link) => link.type.toLowerCase() === "paper")?.url ??
    links.find((link) => link.type.toLowerCase() === "book")?.url ??
    links[0]?.url ??
    ""
  );
}

function getVenueShort(venue = "") {
  const candidates = [
    {
      pattern: /\bNeurIPS\b|Neural Information Processing Systems/i,
      value: "NeurIPS",
    },
    { pattern: /\bWWW\b|World Wide Web|TheWebConf/i, value: "WWW" },
    { pattern: /\bAAAI\b/i, value: "AAAI" },
    { pattern: /\bCHI\b|Human Factors in Computing Systems/i, value: "CHI" },
    { pattern: /\bCIKM\b/i, value: "CIKM" },
    { pattern: /\bKDD\b|SIGKDD/i, value: "KDD" },
    { pattern: /\bACL\b/i, value: "ACL" },
    { pattern: /\bICLR\b/i, value: "ICLR" },
    { pattern: /\bICML\b/i, value: "ICML" },
    { pattern: /\bICSE\b/i, value: "ICSE" },
    { pattern: /\bASE\b/i, value: "ASE" },
    { pattern: /\bFSE\b|Foundations of Software Engineering/i, value: "FSE" },
    { pattern: /\bAMIA\b/i, value: "AMIA" },
    { pattern: /\bSAIL\b/i, value: "SAIL" },
    { pattern: /\bBIBM\b/i, value: "BIBM" },
    { pattern: /\bTOSEM\b/i, value: "TOSEM" },
    { pattern: /\bMIDL\b/i, value: "MIDL" },
    { pattern: /npj Digital Medicine/i, value: "npj Digital Medicine" },
    { pattern: /Cell Patterns|Patterns/i, value: "Cell Patterns" },
    { pattern: /STAR Protocols/i, value: "Cell Protocols" },
    { pattern: /The Innovation/i, value: "The Innovation" },
    { pattern: /Health Data Science/i, value: "HDS" },
    { pattern: /Journal of Pharmaceutical Analysis/i, value: "JPA" },
    { pattern: /British Journal of Radiology/i, value: "BJR" },
    { pattern: /Pediatric Radiology/i, value: "Pediatr Radiol" },
    { pattern: /Translational Pediatrics/i, value: "TP" },
    { pattern: /Chinese Journal of Evidence-Based Pediatrics/i, value: "CJEBP" },
    { pattern: /Asian and Oceanic Society for Paediatric Radiology|AOSPR/i, value: "AOSPR" },
    { pattern: /International Conference on Industrial Artificial Intelligence|IAI/i, value: "IAI" },
    { pattern: /Journal of Guangxi Medical University/i, value: "JGMU" },
    { pattern: /China Machine Press/i, value: "Book" },
    { pattern: /Tsinghua University Press/i, value: "Book" },
    { pattern: /Preprint|arXiv/i, value: "Preprint" },
  ];

  return (
    candidates.find((candidate) => candidate.pattern.test(venue))?.value ??
    firstVenuePhrase(venue)
  );
}

function firstVenuePhrase(venue = "") {
  return stripYear(venue, "").split(",")[0]?.trim() || "Publication";
}

function stripYear(venue = "", year = "") {
  return venue
    .replace(new RegExp(`,?\\s*${escapeRegExp(year)}\\s*$`), "")
    .trim();
}

function htmlToText(value = "") {
  return decodeHtmlEntities(
    value
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<a\b[^>]*>(.*?)<\/a>/gi, "$1")
      .replace(/<[^>]*>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtmlEntities(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function tex(value: unknown = "") {
  return String(value)
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function href(value = "") {
  return value
    .replace(/\\/g, "/")
    .replace(/%/g, "\\%")
    .replace(/#/g, "\\#")
    .replace(/&/g, "\\&")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}");
}

function escapeRegExp(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
