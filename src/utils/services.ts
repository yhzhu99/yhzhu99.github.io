export function getLatestServiceYear(year: unknown) {
  const years = String(year ?? "").match(/\b\d{4}\b/g)?.map(Number) ?? [];

  return years.length > 0 ? Math.max(...years) : Number.NEGATIVE_INFINITY;
}

export function sortServiceItems<
  T extends { year?: unknown; content?: unknown },
>(items: readonly T[]): T[] {
  return [...items].sort(compareServiceItems);
}

function compareServiceItems(
  a: { year?: unknown; content?: unknown },
  b: { year?: unknown; content?: unknown },
) {
  const yearDifference =
    getLatestServiceYear(b.year) - getLatestServiceYear(a.year);

  if (yearDifference !== 0) {
    return yearDifference;
  }

  return String(a.content ?? "").localeCompare(String(b.content ?? ""), "en", {
    sensitivity: "base",
  });
}
