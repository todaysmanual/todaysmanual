/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/cms/content";
import { BrandLogo } from "../../components/BrandLogo";
import { Icon } from "../../components/Icon";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { article } = await getArticleBySlug(slug);
  return { title: article?.title ?? "Article", description: article?.excerpt };
}

function ArticleBody({ body }: { body: string }) {
  const blocks = body.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return blocks.map((block, index) => {
    if (block.startsWith("## ")) return <h2 key={index}>{block.slice(3)}</h2>;
    if (block.startsWith("### ")) return <h3 key={index}>{block.slice(4)}</h3>;
    if (block.split("\n").every((line) => line.startsWith("- "))) {
      return <ul key={index}>{block.split("\n").map((line) => <li key={line}>{line.slice(2)}</li>)}</ul>;
    }
    return <p key={index}>{block}</p>;
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { article: story, config } = await getArticleBySlug(slug);
  if (!story) notFound();

  return (
    <main className="article-page">
      <nav className="article-nav page-shell" aria-label="Article navigation">
        <Link href="/" className="article-nav__logo"><BrandLogo src={config.logoUrl} /></Link>
        <Link href="/" className="route-page__back"><Icon name="arrow" size={17} /> Back to home</Link>
      </nav>
      <article>
        <header className="article-page__header page-shell">
          <p className="eyebrow eyebrow--orange">{story.category_slug} / Guide</p>
          <h1>{story.title}</h1>
          <p>{story.excerpt}</p>
          <div className="article-page__meta">By {story.author} <i /> {story.read_time}</div>
        </header>
        <figure className="article-page__image page-shell"><img src={story.image_url} alt={story.image_alt} width="1600" height="1000" /></figure>
        <div className="article-page__body page-shell">
          <ArticleBody body={story.body} />
          <Link className="dark-button" href="/">Explore Today’s Manual <Icon name="arrow" size={17} /></Link>
        </div>
      </article>
    </main>
  );
}
