/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { heroArticle, quickReads, secondaryStories } from "../../data/homepage";
import { BrandLogo } from "../../components/BrandLogo";
import { Icon } from "../../components/Icon";

const allStories = [heroArticle, ...secondaryStories, ...quickReads];

function titleFromSlug(slug: string) {
  return slug.split("-").map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`).join(" ");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = allStories.find((item) => item.slug === slug);
  return { title: story?.title ?? titleFromSlug(slug) };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = allStories.find((item) => item.slug === slug);
  const title = story?.title ?? titleFromSlug(slug);
  const image = story?.image ?? "/editorial/work.jpg";
  const imageAlt = story?.imageAlt ?? "Today’s Manual editorial story";

  return (
    <main className="article-page">
      <nav className="article-nav page-shell" aria-label="Article navigation">
        <Link href="/" className="article-nav__logo"><BrandLogo /></Link>
        <Link href="/" className="route-page__back"><Icon name="arrow" size={17} /> Back to home</Link>
      </nav>
      <article>
        <header className="article-page__header page-shell">
          <p className="eyebrow eyebrow--orange">{story?.category ?? "Today’s Manual"} / Guide</p>
          <h1>{title}</h1>
          <p>{story?.excerpt ?? "A practical Today’s Manual guide is being prepared for this topic. The full story will be published in an upcoming edition."}</p>
          <div className="article-page__meta">By Today’s Manual <i /> {story?.readTime ?? "Coming soon"}</div>
        </header>
        <figure className="article-page__image page-shell"><img src={image} alt={imageAlt} width="1600" height="1000" /></figure>
        <div className="article-page__placeholder page-shell">
          <p className="eyebrow">Article preview</p>
          <h2>The useful version is on its way.</h2>
          <p>We’re building this story with the context, examples and practical next steps it deserves. Explore the homepage for more guidance in the meantime.</p>
          <Link className="dark-button" href="/">Explore Today’s Manual <Icon name="arrow" size={17} /></Link>
        </div>
      </article>
    </main>
  );
}
