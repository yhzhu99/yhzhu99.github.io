import assert from "node:assert/strict";
import test from "node:test";
import type { Publication } from "../src/types";
import { siteData } from "../src/utils/site-data";
import {
  formatBibtex,
  getBibtexCitationKey,
  getCvAuthorNames,
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

test("shortens CV authors around Yinghao Zhu", () => {
  assert.deepEqual(
    getCvAuthorNames("Yinghao Zhu, A One, B Two, C Three, D Four"),
    ["Yinghao Zhu", "et al."],
  );
  assert.deepEqual(
    getCvAuthorNames("A One, B Two, Yinghao Zhu, C Three, D Four"),
    ["A One", "B Two", "Yinghao Zhu", "et al."],
  );
  assert.deepEqual(
    getCvAuthorNames("A One, B Two, C Three, Yinghao Zhu, D Four"),
    ["...", "Yinghao Zhu", "..."],
  );
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
    item.title.startsWith(
      "Foundation models and intelligent decision-making",
    ),
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
