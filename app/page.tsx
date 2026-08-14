import { Header } from "./components/Header";
import { HeroStory } from "./components/HeroStory";
import { LowerEditorial } from "./components/LowerEditorial";
import { Manuals } from "./components/Manuals";
import { Newsletter } from "./components/Newsletter";
import { QuickReads } from "./components/QuickReads";
import { SiteFooter } from "./components/SiteFooter";
import { StartHere } from "./components/StartHere";
import { getContentBundle } from "@/lib/cms/content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { articles, categories, config } = await getContentBundle();
  const heroArticle = articles.find((article) => article.slug === config.heroArticleSlug) ?? articles[0];
  const secondaryStories = config.secondaryArticleSlugs.map((slug) => articles.find((article) => article.slug === slug)).filter((article) => article !== undefined);
  const quickReads = config.quickReadSlugs.map((slug) => articles.find((article) => article.slug === slug)).filter((article) => article !== undefined);
  const now = new Date();
  const issueDate = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Africa/Accra",
  }).format(now);
  const initialWorldTimes = Object.fromEntries(
    [
      ["ACC", "Africa/Accra"],
      ["LDN", "Europe/London"],
      ["NYC", "America/New_York"],
    ].map(([label, timeZone]) => [
      label,
      new Intl.DateTimeFormat("en-GB", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now),
    ]),
  );

  return (
    <>
      <Header
        issueDate={issueDate}
        initialWorldTimes={initialWorldTimes}
        config={config}
        categories={categories}
        articles={articles.map(({ slug, title, category_slug, excerpt, read_time }) => ({ slug, title, category_slug, excerpt, read_time }))}
      />
      <main>
        {heroArticle && <HeroStory heroArticle={heroArticle} secondaryStories={secondaryStories} />}
        <StartHere config={config} />
        <Manuals categories={categories} config={config} />
        <QuickReads stories={quickReads} config={config} />
        <LowerEditorial config={config} />
        <Newsletter config={config} />
      </main>
      <SiteFooter year={now.getFullYear()} config={config} />
    </>
  );
}
