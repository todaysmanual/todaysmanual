import type { ArticleRecord } from "./types";

export type SearchableArticle = Pick<ArticleRecord, "slug" | "title" | "category_slug" | "excerpt"> & Partial<Pick<ArticleRecord, "body" | "image_url" | "image_alt" | "read_time" | "author">>;
export type SearchSuggestionArticle = Pick<ArticleRecord, "slug" | "title" | "category_slug" | "excerpt" | "read_time">;

const synonymGroups = [
  ["job", "jobs", "career", "careers", "work", "employment", "interview", "cv"],
  ["money", "finance", "financial", "salary", "income", "wealth", "saving", "budget"],
  ["business", "entrepreneur", "entrepreneurship", "freelance", "freelancing", "startup", "hustle"],
  ["school", "student", "university", "graduate", "graduation", "degree", "masters"],
  ["learn", "learning", "skill", "skills", "course", "training", "productivity"],
  ["opportunity", "opportunities", "scholarship", "fellowship", "grant", "application"],
  ["technology", "tech", "ai", "automation", "digital", "remote"],
  ["lost", "direction", "purpose", "change", "next", "life"],
] as const;

const stopWords = new Set(["a", "an", "and", "article", "for", "guide", "how", "in", "manual", "no", "of", "on", "or", "such", "the", "to", "with"]);

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function words(value: string) {
  return normalizeSearchText(value).split(" ").filter(Boolean);
}

function expandedTerms(term: string) {
  const group = synonymGroups.find((items) => (items as readonly string[]).includes(term));
  return group ? [...group].filter((item) => item !== term) : [];
}

function editDistance(left: string, right: string) {
  if (Math.abs(left.length - right.length) > 1) return 2;
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    let rowMinimum = current[0];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const cost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + cost,
      );
      rowMinimum = Math.min(rowMinimum, current[rightIndex]);
    }
    if (rowMinimum > 1) return 2;
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}

function fieldScore(term: string, value: string, exact: number, partial: number) {
  const normalized = normalizeSearchText(value);
  if (!normalized) return 0;
  if (words(normalized).includes(term)) return exact;
  if (term.length >= 3 && normalized.includes(term)) return partial;
  return 0;
}

function scoreArticle(article: SearchableArticle, query: string) {
  const normalizedQuery = normalizeSearchText(query);
  const rawTerms = words(query);
  const meaningfulTerms = rawTerms.filter((term) => !stopWords.has(term));
  const queryTerms = meaningfulTerms.length > 0 ? meaningfulTerms : rawTerms;
  if (!normalizedQuery || queryTerms.length === 0) return 0;

  const title = normalizeSearchText(article.title);
  const excerpt = normalizeSearchText(article.excerpt);
  const body = normalizeSearchText(article.body ?? "");
  const category = normalizeSearchText(article.category_slug);
  const slug = normalizeSearchText(article.slug);
  let score = 0;

  if (title === normalizedQuery) score += 220;
  else if (title.startsWith(normalizedQuery)) score += 130;
  else if (normalizedQuery.length >= 3 && title.includes(normalizedQuery)) score += 90;
  if (excerpt.includes(normalizedQuery)) score += 40;
  if (body.includes(normalizedQuery)) score += 18;
  if (category === normalizedQuery) score += 80;
  if (slug.includes(normalizedQuery)) score += 35;

  const titleWords = words(article.title);
  const excerptWords = words(article.excerpt);
  let matchedTerms = 0;
  for (const term of queryTerms) {
    let termScore = 0;
    termScore += fieldScore(term, article.title, 34, 20);
    termScore += fieldScore(term, article.excerpt, 18, 10);
    termScore += fieldScore(term, article.body ?? "", 6, 3);
    termScore += fieldScore(term, article.category_slug, 24, 12);

    for (const alias of expandedTerms(term)) {
      termScore += fieldScore(alias, article.title, 8, 4);
      termScore += fieldScore(alias, article.excerpt, 4, 2);
      termScore += fieldScore(alias, article.category_slug, 6, 3);
    }

    if (term.length >= 4 && !titleWords.includes(term) && !excerptWords.includes(term)) {
      if (titleWords.some((word) => word.length >= 4 && editDistance(term, word) <= 1)) termScore += 24;
      else if (excerptWords.some((word) => word.length >= 4 && editDistance(term, word) <= 1)) termScore += 10;
    }
    if (termScore > 0) matchedTerms += 1;
    score += termScore;
  }

  const requiredMatches = Math.max(1, Math.ceil(queryTerms.length * 0.6));
  if (matchedTerms < requiredMatches) return 0;
  return score;
}

export function searchArticles<T extends SearchableArticle>(query: string, articles: T[]) {
  return articles
    .map((article) => ({ article, score: scoreArticle(article, query) }))
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.article.title.localeCompare(right.article.title))
    .map((result) => result.article);
}

export function matchesSearch(query: string, values: Array<string | number | null | undefined>) {
  const terms = words(query);
  if (terms.length === 0) return true;
  const haystack = normalizeSearchText(values.filter((value) => value !== null && value !== undefined).join(" "));
  return terms.every((term) => haystack.includes(term));
}
