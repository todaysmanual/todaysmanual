/* eslint-disable @next/next/no-img-element */
import { heroArticle, secondaryStories } from "../data/homepage";
import { Icon } from "./Icon";

export function HeroStory() {
  return (
    <section className="hero-story page-shell" aria-labelledby="hero-title">
      <div className="hero-story__copy">
        <p className="eyebrow eyebrow--orange">Work / Career</p>
        <h1 id="hero-title">Nobody Told Us<br />What Happens<br />After University<span className="accent">.</span></h1>
        <p className="hero-story__excerpt">{heroArticle.excerpt}</p>
        <div className="hero-story__meta-row">
          <div className="byline-mark" aria-hidden="true"><span>TM</span></div>
          <div className="hero-story__byline"><strong>By Today’s Manual</strong><span>{heroArticle.readTime} <i /> Featured</span></div>
          <a className="dark-button" href={`/article/${heroArticle.slug}`}>Read the story <Icon name="arrow" size={17} /></a>
        </div>
      </div>

      <a className="hero-story__image image-link" href={`/article/${heroArticle.slug}`} aria-label={`Read ${heroArticle.title}`}>
        <img src={heroArticle.image} alt={heroArticle.imageAlt} width="1200" height="800" fetchPriority="high" />
        <span className="image-badge">Featured</span>
      </a>

      <div className="hero-story__secondary">
        {secondaryStories.map((story) => (
          <article className={`side-story side-story--${story.category.toLowerCase()}`} key={story.id}>
            <a href={`/article/${story.slug}`}>
              <img src={story.image} alt={story.imageAlt} width="1200" height="800" />
              <span className="side-story__shade" />
              <span className="side-story__content">
                <span className="eyebrow">{story.category}</span>
                <strong>{story.title}</strong>
                <span className="story-meta">{story.readTime} <Icon name="arrow" size={15} /></span>
              </span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
