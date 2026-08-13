/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { manuals, quickReads, secondaryStories } from "../data/homepage";
import { Icon } from "./Icon";

export function CategoryPage({ category }: { category: string }) {
  const title = `${category[0].toUpperCase()}${category.slice(1)}`;
  const manual = manuals.find((item) => item.slug === category)!;
  const stories = [...secondaryStories, ...quickReads].filter((story) => story.category.toLowerCase() === category);

  return (
    <main className="route-page">
      <header className="route-page__header page-shell" style={{ "--category-color": manual.color } as React.CSSProperties}>
        <Link className="route-page__back" href="/"><Icon name="arrow" size={17} /> Back to home</Link>
        <p className="eyebrow">The {title} Manual</p>
        <h1>{title}<span className="accent">.</span></h1>
        <p>{manual.description} Fresh, practical guidance for the decisions in front of you.</p>
      </header>
      <section className="route-page__stories page-shell" aria-label={`${title} stories`}>
        {(stories.length ? stories : quickReads.slice(0, 3)).map((story) => (
          <article key={story.id}>
            <Link href={`/article/${story.slug}`}>
              <img src={story.image} alt={story.imageAlt} width="1200" height="800" />
              <span className="eyebrow">{story.category}</span>
              <h2>{story.title}</h2>
              <small>{story.readTime}</small>
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
