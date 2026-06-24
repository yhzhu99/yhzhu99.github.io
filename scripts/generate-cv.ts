import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type {
  AwardItem,
  LinkItem,
  Publication,
  ServiceGroup,
} from "../src/types";
import { siteData } from "../src/utils/site-data";
import { sortPublications } from "../src/utils/publications";

const DEFAULT_OUTPUT_PATH = "build/cv/YinghaoZhu_CV.tex";
const HOMEPAGE_URL = "https://yhzhu99.github.io/";
const SCHOLAR_URL = "https://scholar.google.com/citations?user=LYrsSoEAAAAJ";

const outputPath = resolve(
  process.cwd(),
  process.argv[2] ?? DEFAULT_OUTPUT_PATH,
);

const featuredPublications = sortPublications(
  siteData.publications.filter((publication) => publication.featured),
);

const cv = String.raw`\documentclass[10pt,a4paper]{article}

\usepackage[left=0.5in,right=0.5in,top=0.5in,bottom=0.5in]{geometry}
\usepackage{hyperref}
\usepackage{enumitem}
\usepackage[T1]{fontenc}
\usepackage{parskip}
\usepackage{xcolor}
\pagenumbering{gobble}

\definecolor{darkred}{RGB}{153,0,0}

\hypersetup{
    colorlinks=true,
    linkcolor=darkred,
    urlcolor=darkred,
    pdftitle={Yinghao Zhu's CV},
    pdfauthor={Yinghao Zhu},
    pageanchor=false
}

\newcommand{\sectiontitle}[1]{
    \vspace{4mm}
    {\large\textbf{#1}}
    \vspace{1mm}
    \hrule
    \vspace{3mm}
}

\newcommand{\entryhead}[2]{
    \noindent
    \begin{minipage}[t]{0.76\textwidth}
    #1
    \end{minipage}
    \hfill
    \begin{minipage}[t]{0.22\textwidth}
    \raggedleft #2
    \end{minipage}
    \par
}

\newcommand{\pubentry}[5]{
    \noindent
    \begin{minipage}[t]{0.19\textwidth}
    \raggedright\textbf{#1}
    \end{minipage}
    \begin{minipage}[t]{0.80\textwidth}
    \textbf{#2}\\
    #3\\
    \textit{#4}, #5
    \end{minipage}
    \vspace{2mm}
}

\setlength{\parindent}{0pt}
\setlength{\parskip}{0.5mm}
\setlist[itemize]{leftmargin=*,topsep=2pt,itemsep=1pt,parsep=0pt}
\sloppy

\begin{document}

\begin{center}
{\huge\textbf{${tex(siteData.profile.name)}}}\\
\vspace{2mm}
\textbf{E-mail:} \href{mailto:${href(siteData.profile.email)}}{${tex(siteData.profile.email)}}\hspace{5mm}
\textbf{Homepage:} \href{${href(HOMEPAGE_URL)}}{${tex(HOMEPAGE_URL)}}
\end{center}

\sectiontitle{Research Interest}
My research focuses on \textbf{AI for Healthcare}, with a particular emphasis on the following areas:
\begin{itemize}
${siteData.profile.interests.map(formatInterest).join("\n")}
\end{itemize}

\sectiontitle{Education}
${siteData.education.map(formatEducation).join("\n\n")}

\sectiontitle{Professional Experience}
${siteData.experience.map(formatExperience).join("\n\n")}

\sectiontitle{Featured Publications \href{${href(SCHOLAR_URL)}}{\textcolor{darkred}{[Google Scholar]}} {\normalfont\small ($^{\ast}$ indicates equal contribution; $^{\dagger}$ indicates corresponding author)}}
${featuredPublications.map(formatPublication).join("\n\n")}

\sectiontitle{Selected Honors and Awards}
${siteData.awards.map(formatAward).join("\n")}

\sectiontitle{Invited Talks}
${siteData.talks.map(formatTalk).join("\n")}

\sectiontitle{Services}
${siteData.services.map(formatServiceGroup).join("\n\n")}

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

function formatInterest(interest: {
  title: string;
  description?: string;
  desc?: string;
}) {
  const description = interest.description ?? interest.desc ?? "";
  const suffix = description ? `: ${tex(description)}` : "";

  return `    \\item \\textbf{${tex(interest.title)}}${suffix}`;
}

function formatEducation(item: {
  institution?: string;
  location?: string;
  period?: string;
  degree?: string;
  details?: string;
}) {
  return formatTimelineEntry(
    `\\textbf{${tex(item.institution)}}${formatLocation(item.location)}`,
    item.period,
    [item.degree, item.details ? htmlToText(item.details) : ""],
  );
}

function formatExperience(item: {
  organization?: string;
  location?: string;
  period?: string;
  position?: string;
  details?: string;
}) {
  return formatTimelineEntry(
    `\\textbf{${tex(item.organization)}}${formatLocation(item.location)}`,
    item.period,
    [item.position, item.details ? htmlToText(item.details) : ""],
  );
}

function formatTimelineEntry(title: string, period = "", lines: string[] = []) {
  const details = lines
    .filter(Boolean)
    .map((line) => `${tex(line)}\\\\`)
    .join("\n");

  return [`\\entryhead{${title}}{${tex(period)}}`, details, "\\vspace{2mm}"]
    .filter(Boolean)
    .join("\n");
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

  return `\\entryhead{${tex(item.title)}${organization}}{${tex(item.year)}}`;
}

function formatTalk(item: AwardItem) {
  const venue = item.venue ? `, \\textit{${tex(item.venue)}}` : "";

  return `\\entryhead{${tex(item.title)}${venue}}{${tex(item.year)}}`;
}

function formatServiceGroup(group: ServiceGroup) {
  const items = group.items
    .map((item) => `\\entryhead{${tex(item.content)}}{${tex(item.year)}}`)
    .join("\n");

  return `\\textcolor{darkred}{\\textbf{${tex(group.title)}}}
\\vspace{1mm}

${items}`;
}

function formatLocation(location = "") {
  return location ? `, ${tex(location)}` : "";
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
    { pattern: /npj Digital Medicine/i, value: "npj Digital Medicine" },
    { pattern: /Cell Patterns|Patterns/i, value: "Cell Patterns" },
    { pattern: /STAR Protocols/i, value: "Cell Protocols" },
    { pattern: /The Innovation/i, value: "The Innovation" },
    { pattern: /Health Data Science/i, value: "Health Data Science" },
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
