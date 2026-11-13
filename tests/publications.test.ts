import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import type { Publication } from "../src/types";
import { siteData } from "../src/utils/site-data";
import { publicationIllustrations } from "../src/data/publication-illustrations";
import {
  formatBibtex,
  getBibtexCitationKey,
  getCvAuthorNames,
  getCvVenueShort,
} from "../src/utils/publications";

function publication(overrides: Partial<Publication> = {}): Publication {
  return {
    uid: "publication-test",
    title: "A Study of Care & Safety",
    authors: "Yinghao Zhu, Jane Doe, John Smith",
    venue: "Journal of Tests, Cover",
    year: "2026",
    publicationType: "journal",
    links: [{ type: "Paper", url: "https://doi.org/10.1234/test.5678" }],
    ...overrides,
  };
}

test("featured publications have a matching visual summary", () => {
  for (const item of siteData.publications.filter((entry) => entry.featured)) {
    assert.ok(item.illustration, `${item.title} is missing a visual summary`);
    assert.ok(publicationIllustrations[item.illustration], item.illustration);
    assert.ok(
      item.links.some((link) => link.type === "Paper"),
      item.title,
    );
  }
});

test("keeps MedMMV as one publication with its earlier workshop noted", () => {
  const entries = siteData.publications.filter((item) =>
    item.title.startsWith("MedMMV:"),
  );
  assert.equal(entries.length, 1);
  assert.match(entries[0].venue, /EACL/);
  assert.match(entries[0].additionalVenue ?? "", /ICLR 2026.*Workshop/);
  assert.deepEqual(
    entries[0].links.map((link) => link.type),
    ["Paper"],
  );
  assert.equal(getCvVenueShort(entries[0].venue), "EACL");
  assert.match(
    formatBibtex(entries[0]),
    /booktitle = \{Findings of the European Chapter of the Association for Computational Linguistics \(EACL\)\}/,
  );
});

test("keeps the COVID-19 benchmark journal paper and earlier oral abstract together", () => {
  const entries = siteData.publications.filter((item) =>
    item.title
      .toLowerCase()
      .startsWith("a comprehensive benchmark for covid-19 predictive modeling"),
  );
  assert.equal(entries.length, 1);
  assert.equal(entries[0].venue, "Cell Patterns");
  assert.match(entries[0].additionalVenue ?? "", /AMIA.*2023.*Oral/);
  assert.match(formatBibtex(entries[0]), /journal = \{Cell Patterns\}/);
});

test("formats journal BibTeX with complete authors, DOI, and escaped text", () => {
  const bibtex = formatBibtex(publication());

  assert.match(bibtex, /^@article\{zhu2026study,/);
  assert.match(bibtex, /author = \{Yinghao Zhu and Jane Doe and John Smith\}/);
  assert.match(bibtex, /title = \{A Study of Care \\& Safety\}/);
  assert.match(bibtex, /journal = \{Journal of Tests\}/);
  assert.match(bibtex, /doi = \{10\.1234\/test\.5678\}/);
});

test("formats conference, preprint, and book-specific BibTeX fields", () => {
  const conference = formatBibtex(
    publication({
      publicationType: "conference",
      venue: "Conference on Tests, Oral",
    }),
  );
  const preprint = formatBibtex(
    publication({
      publicationType: "preprint",
      venue: "Preprint",
      links: [{ type: "Paper", url: "https://arxiv.org/abs/2601.12345" }],
    }),
  );
  const book = formatBibtex(
    publication({
      publicationType: "book",
      venue: "Example University Press",
      links: [{ type: "Book", url: "https://example.com/book" }],
    }),
  );

  assert.match(conference, /^@inproceedings/);
  assert.match(conference, /booktitle = \{Conference on Tests\}/);
  assert.match(preprint, /^@misc/);
  assert.match(preprint, /eprint = \{2601\.12345\}/);
  assert.match(preprint, /archivePrefix = \{arXiv\}/);
  assert.match(book, /^@book/);
  assert.match(book, /publisher = \{Example University Press\}/);
});

test("keeps full CV authors and abbreviates long lists with et al.", () => {
  assert.deepEqual(
    getCvAuthorNames("Yinghao Zhu, A One, B Two, C Three, D Four"),
    ["Yinghao Zhu", "A One", "B Two", "C Three", "D Four"],
  );
  assert.deepEqual(
    getCvAuthorNames(
      "A One, B Two, C Three, D Four, E Five, Yinghao Zhu, F Six",
      4,
    ),
    ["A One", "B Two", "C Three", "D Four", "et al."],
  );
});

test("uses parenthetical acronyms for CV venue labels", () => {
  assert.equal(
    getCvVenueShort(
      "The 2026 Conference on Empirical Methods in Natural Language Processing (EMNLP)",
    ),
    "EMNLP",
  );
  assert.equal(
    getCvVenueShort(
      "ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD-26) Hands-On Tutorials",
    ),
    "KDD",
  );
  assert.equal(getCvVenueShort("npj Digital Medicine"), "npj Digital Medicine");
  assert.equal(getCvVenueShort(""), "Publication");
});

test("all publication records have full authors and unique citation keys", () => {
  const keys = siteData.publications.map(getBibtexCitationKey);
  const ptbPublication = siteData.publications.find((item) =>
    item.title.startsWith("Dynamic prediction of preterm birth"),
  );

  assert.equal(
    siteData.publications.some((item) => /\bet al\./i.test(item.authors)),
    false,
  );
  assert.equal(new Set(keys).size, keys.length);
  assert.equal(
    siteData.publications.every((item) => Boolean(formatBibtex(item))),
    true,
  );
  assert.equal(ptbPublication?.featured, true);
});

test("records contribution roles from the two previously abbreviated papers", () => {
  const foundationModels = siteData.publications.find((item) =>
    item.title.startsWith("Foundation models and intelligent decision-making"),
  );
  const imagingX = siteData.publications.find((item) =>
    item.title.startsWith("Project Imaging-X"),
  );

  assert.equal(
    foundationModels?.firstAuthors,
    "Jincai Huang, Yongjun Xu, Qi Wang, Qi (Cheems) Wang, Xingxing Liang, Fei Wang, Zhao Zhang, Wei Wei, Boxuan Zhang, Libo Huang, Jingru Chang, Liantao Ma, Ting Ma, Yuxuan Liang, Jie Zhang, Jian Guo, Xuhui Jiang, Xinxin Fan, Zhulin An, Tingting Li",
  );
  assert.equal(
    foundationModels?.correspondingAuthors,
    "Sihang Qiu, Yanjie Dong, Xiaolong Zheng, Gang Wang, Yu Zheng, Yuanzhuo Wang, Jiafeng Guo, Lizhe Wang, Xueqi Cheng, Yaonan Wang, Shanlin Yang, Mengyin Fu, Aiguo Fei",
  );
  assert.equal(
    imagingX?.firstAuthors,
    "Zhongying Deng, Cheng Tang, Ziyan Huang, Jiashi Lin, Ying Chen, Junzhi Ning, Chenglong Ma",
  );
  assert.equal(
    imagingX?.correspondingAuthors,
    "Ming Hu, Jin Ye, Zhifeng Li, Yirong Chen, Yu Qiao, Junjun He",
  );
});

test("keeps featured publications and publication metadata visible on mobile viewports", () => {
  const styles = readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");
  const homeView = readFileSync(
    resolve(process.cwd(), "src/views/HomeView.vue"),
    "utf8",
  );
  const publicationCard = readFileSync(
    resolve(process.cwd(), "src/components/PublicationCard.vue"),
    "utf8",
  );

  assert.doesNotMatch(
    styles,
    /\.featured-publications-section\s*\{\s*display:\s*none/s,
  );
  assert.doesNotMatch(styles, /\.publication-meta\s*\{\s*display:\s*none/s);
  assert.doesNotMatch(homeView, /featured-publications-section[^"]*hidden/);
  assert.match(homeView, /id="mobile-navigation"/);
  assert.match(publicationCard, /Show all authors/);
});
