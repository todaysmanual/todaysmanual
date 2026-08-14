/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "../components/BrandLogo";
import { Icon } from "../components/Icon";
import { SiteFooter } from "../components/SiteFooter";
import { getContentBundle } from "@/lib/cms/content";
import { searchArticles } from "@/lib/cms/search";

export const metadata: Metadata = {
  title: "Search",
  description: "Search every published Today’s Manual guide and article.",
};

export const dynamic = "force-dynamic";

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; manual?: string | string[] }> }) {
  const params = await searchParams;
  const query = firstValue(params.q).trim().slice(0, 120);
  const requestedManual = firstValue(params.manual).trim();
  const { articles, categories, config } = await getContentBundle();
  const manual = categories.some((category) => category.slug === requestedManual) ? requestedManual : "";
  const availableArticles = manual ? articles.filter((article) => article.category_slug === manual) : articles;
  const results = query ? searchArticles(query, availableArticles) : availableArticles;

  return <>
    <main className="search-page">
      <nav className="article-nav page-shell" aria-label="Search navigation">
        <Link href="/" className="article-nav__logo"><BrandLogo src={config.logoUrl} /></Link>
        <Link href="/" className="route-page__back"><Icon name="arrow" size={17} /> Back to home</Link>
      </nav>
      <header className="search-page__header page-shell">
        <p className="eyebrow eyebrow--orange">Search the publication</p>
        <h1>Find what you need<span className="accent">.</span></h1>
        <form action="/search" role="search" className="search-page__form">
          <label><span className="sr-only">Search all articles</span><Icon name="search" size={22} /><input name="q" defaultValue={query} placeholder="Search interviews, careers, money, skills…" autoFocus /></label>
          <label><span className="sr-only">Filter by manual</span><select name="manual" defaultValue={manual}><option value="">All manuals</option>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.title} Manual</option>)}</select></label>
          <button className="dark-button" type="submit">Search <Icon name="arrow" size={17} /></button>
        </form>
        {!query && <div className="search-page__popular"><span>Popular:</span>{config.popularTopics.slice(0, 6).map((topic) => <Link key={topic} href={`/search?q=${encodeURIComponent(topic)}`}>{topic}</Link>)}</div>}
      </header>
      <section className="search-results page-shell" aria-live="polite">
        <div className="search-results__heading">
          <div><p className="eyebrow">{query ? "Search results" : "Browse the archive"}</p><h2>{query ? <>Results for “{query}”</> : "Every published guide"}</h2></div>
          <p>{results.length} {results.length === 1 ? "result" : "results"}{manual ? ` in ${categories.find((category) => category.slug === manual)?.title}` : ""}</p>
        </div>
        {results.length > 0 ? <div className="search-results__grid">{results.map((article) => <article key={article.slug}><Link href={`/article/${article.slug}`}><img src={article.image_url} alt={article.image_alt} width="720" height="480" loading="lazy" /><div><span className="eyebrow eyebrow--orange">{article.category_slug}</span><h3>{article.title}</h3><p>{article.excerpt}</p><small>{article.read_time} · By {article.author}</small></div></Link></article>)}</div> : <div className="search-results__empty"><h2>No results found.</h2><p>Try a broader phrase, check the spelling, or choose a different manual. Search understands related terms such as job and career, or salary and money.</p><Link className="dark-button" href="/search">Browse every article <Icon name="arrow" size={17} /></Link></div>}
      </section>
    </main>
    <SiteFooter year={new Date().getFullYear()} config={config} />
  </>;
}
