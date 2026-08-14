/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ArticleRecord, SiteConfig } from "@/lib/cms/types";
import { Icon } from "./Icon";

export function QuickReads({ stories, config }: { stories: ArticleRecord[]; config: SiteConfig }) {
  return (
    <section className="quick-section section-rule" aria-labelledby="quick-title">
      <div className="page-shell quick-section__grid">
        <header className="section-intro section-intro--quick">
          <h2 id="quick-title">{config.quickReadsTitle}</h2>
          <p>{config.quickReadsDescription}</p>
          <Link className="text-link" href="/skills">See all quick reads <Icon name="arrow" size={16} /></Link>
        </header>
        <div className="quick-strip">
          {stories.map((story, index) => (
            <article className="quick-card" key={story.id}>
              <Link href={`/article/${story.slug}`}>
                <span className="quick-card__image">
                  <img src={story.image_url} alt={story.image_alt} loading="lazy" width="1200" height="800" />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </span>
                <strong>{story.title}</strong>
                <small>{story.read_time}</small>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
