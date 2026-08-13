/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { quickReads } from "../data/homepage";
import { Icon } from "./Icon";

export function QuickReads() {
  return (
    <section className="quick-section section-rule" aria-labelledby="quick-title">
      <div className="page-shell quick-section__grid">
        <header className="section-intro section-intro--quick">
          <h2 id="quick-title">You should<br />know this<span className="accent">.</span></h2>
          <p>Quick reads to help you make smarter decisions.</p>
          <Link className="text-link" href="/skills">See all quick reads <Icon name="arrow" size={16} /></Link>
        </header>
        <div className="quick-strip">
          {quickReads.map((story) => (
            <article className="quick-card" key={story.id}>
              <Link href={`/article/${story.slug}`}>
                <span className="quick-card__image">
                  <img src={story.image} alt={story.imageAlt} loading="lazy" width="1200" height="800" />
                  <span>{story.id}</span>
                </span>
                <strong>{story.title}</strong>
                <small>{story.readTime}</small>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
