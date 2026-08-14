/* eslint-disable @next/next/no-img-element */
import type { ArticleRecord } from "@/lib/cms/types";
import { Icon } from "./Icon";

export function HeroStory({ heroArticle, secondaryStories }: { heroArticle: ArticleRecord; secondaryStories: ArticleRecord[] }) {
  return (
    <section className="hero-story page-shell" aria-labelledby="hero-title">
      <div className="hero-story__copy">
        <p className="eyebrow eyebrow--orange">{heroArticle.category_slug} / Guide</p>
        <h1 id="hero-title">{heroArticle.title}</h1>
        <p className="hero-story__excerpt">{heroArticle.excerpt}</p>
        <div className="hero-story__meta-row">
          <div className="byline-mark" aria-hidden="true"><span>TM</span></div>
          <div className="hero-story__byline"><strong>By {heroArticle.author}</strong><span>{heroArticle.read_time} <i /> Featured</span></div>
          <a className="dark-button" href={`/article/${heroArticle.slug}`}>Read the story <Icon name="arrow" size={17} /></a>
        </div>
      </div>

      <a className="hero-story__image image-link" href={`/article/${heroArticle.slug}`} aria-label={`Read ${heroArticle.title}`}>
        <img src={heroArticle.image_url} alt={heroArticle.image_alt} width="1200" height="800" fetchPriority="high" />
        <span className="image-badge">Featured</span>
      </a>

      <div className="hero-story__secondary">
        {secondaryStories.map((story) => (
          <article className={`side-story side-story--${story.category_slug}`} key={story.id}>
            <a href={`/article/${story.slug}`}>
              <img src={story.image_url} alt={story.image_alt} width="1200" height="800" />
              <span className="side-story__shade" />
              <span className="side-story__content">
                <span className="eyebrow">{story.category_slug}</span>
                <strong>{story.title}</strong>
                <span className="story-meta">{story.read_time} <Icon name="arrow" size={15} /></span>
              </span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
