/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { SiteConfig } from "@/lib/cms/types";
import { Icon } from "./Icon";

export function LowerEditorial({ config }: { config: SiteConfig }) {
  const { voice, featuredManual } = config;
  return (
    <section className="lower-editorial section-rule" aria-label="Today’s Manual editorial highlights">
      <div className="page-shell lower-editorial__grid">
        <section className="daily-brief" aria-labelledby="daily-title">
          <h2 className="eyebrow" id="daily-title">{config.dailyBriefsTitle}</h2>
          <ol>
            {config.dailyBriefs.map((item) => (
              <li key={item.id}>
                <span>{item.id}</span>
                <div><strong>{item.title}</strong><small>{item.meta}</small></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="voices" aria-labelledby="voices-title">
          <div className="editorial-heading">
            <div><h2 className="eyebrow" id="voices-title">{voice.eyebrow}</h2><p>{voice.description}</p></div>
            <Link className="text-link" href={voice.href}>See all stories <Icon name="arrow" size={16} /></Link>
          </div>
          <figure>
            <span className="quote-mark" aria-hidden="true">“</span>
            <img src={voice.imageUrl} alt={voice.imageAlt} loading="lazy" width="900" height="1350" />
            <blockquote>{voice.quote}</blockquote>
            <figcaption>— {voice.attribution}</figcaption>
          </figure>
          <div className="carousel-dots" aria-label="Story 1 of 5"><i className="active" /><i /><i /><i /><i /></div>
        </section>

        <section className="featured-manual" id="the-manual" aria-labelledby="featured-manual-title">
          <div className="editorial-heading">
            <div><h2 className="eyebrow" id="featured-manual-title">{featuredManual.eyebrow}</h2><p>{featuredManual.description}</p></div>
            <Link className="text-link" href={featuredManual.href}>Read manual <Icon name="arrow" size={16} /></Link>
          </div>
          <Link className="book-feature" href={featuredManual.href}>
            <span className="book-cover">
              <strong>{featuredManual.title}</strong>
              <small>{featuredManual.summary}</small>
              <span>{featuredManual.readTime} <Icon name="arrow" size={15} /></span>
            </span>
            <img src={featuredManual.imageUrl} alt={featuredManual.imageAlt} loading="lazy" width="1200" height="801" />
          </Link>
        </section>
      </div>
    </section>
  );
}
