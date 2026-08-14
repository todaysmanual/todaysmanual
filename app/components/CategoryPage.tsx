/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ArticleRecord, CategoryRecord } from "@/lib/cms/types";
import { Icon } from "./Icon";

export function CategoryPage({ category, stories }: { category: CategoryRecord; stories: ArticleRecord[] }) {
  return (
    <main className="route-page">
      <header className="route-page__header page-shell" style={{ "--category-color": category.color } as React.CSSProperties}>
        <Link className="route-page__back" href="/"><Icon name="arrow" size={17} /> Back to home</Link>
        <p className="eyebrow">The {category.title} Manual</p>
        <h1>{category.title}<span className="accent">.</span></h1>
        <p>{category.description} Fresh, practical guidance for the decisions in front of you.</p>
      </header>
      <section className="route-page__stories page-shell" aria-label={`${category.title} stories`}>
        {stories.map((story) => (
          <article key={story.id}>
            <Link href={`/article/${story.slug}`}>
              <img src={story.image_url} alt={story.image_alt} width="1200" height="800" />
              <span className="eyebrow">{category.title}</span>
              <h2>{story.title}</h2>
              <small>{story.read_time}</small>
            </Link>
          </article>
        ))}
        {stories.length === 0 && <p>No published stories in this manual yet.</p>}
      </section>
    </main>
  );
}
