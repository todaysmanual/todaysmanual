import { defaultArticles, defaultCategories, defaultSiteConfig } from "./defaults";
import type { ArticleRecord, CategoryRecord, ContentBundle, SiteConfig } from "./types";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

function mergeConfig(value: unknown): SiteConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaultSiteConfig;
  const config = value as Partial<SiteConfig>;
  return {
    ...defaultSiteConfig,
    ...config,
    voice: { ...defaultSiteConfig.voice, ...config.voice },
    featuredManual: { ...defaultSiteConfig.featuredManual, ...config.featuredManual },
    newsletter: { ...defaultSiteConfig.newsletter, ...config.newsletter },
  };
}

export async function getContentBundle(options?: { includeDrafts?: boolean }): Promise<ContentBundle> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return { articles: defaultArticles, categories: defaultCategories, config: defaultSiteConfig, source: "fallback" };
  }

  try {
    let articlesQuery = supabase.from("articles").select("*").order("sort_order", { ascending: true });
    if (!options?.includeDrafts) articlesQuery = articlesQuery.eq("status", "published");

    const [articlesResult, categoriesResult, configResult] = await Promise.all([
      articlesQuery,
      supabase.from("categories").select("*").eq("published", true).order("sort_order", { ascending: true }),
      supabase.from("site_settings").select("value").eq("key", "site_config").maybeSingle(),
    ]);

    if (articlesResult.error || categoriesResult.error || configResult.error) {
      console.error("Supabase content load failed", {
        articles: articlesResult.error?.message,
        categories: categoriesResult.error?.message,
        config: configResult.error?.message,
      });
      return { articles: defaultArticles, categories: defaultCategories, config: defaultSiteConfig, source: "fallback" };
    }

    return {
      articles: (articlesResult.data as ArticleRecord[])?.length ? articlesResult.data as ArticleRecord[] : defaultArticles,
      categories: (categoriesResult.data as CategoryRecord[])?.length ? categoriesResult.data as CategoryRecord[] : defaultCategories,
      config: mergeConfig(configResult.data?.value),
      source: "supabase",
    };
  } catch (error) {
    console.error("Supabase content request failed", error);
    return { articles: defaultArticles, categories: defaultCategories, config: defaultSiteConfig, source: "fallback" };
  }
}

export async function getArticleBySlug(slug: string) {
  const bundle = await getContentBundle();
  return { article: bundle.articles.find((item) => item.slug === slug) ?? null, config: bundle.config };
}

export async function getCategoryBySlug(slug: string) {
  const bundle = await getContentBundle();
  return {
    category: bundle.categories.find((item) => item.slug === slug) ?? null,
    articles: bundle.articles.filter((item) => item.category_slug === slug),
    config: bundle.config,
  };
}
