/* eslint-disable @next/next/no-img-element */
import { manuals } from "../data/homepage";
import { Icon } from "./Icon";

export function Manuals() {
  return (
    <section className="manuals-section section-rule" aria-labelledby="manuals-title">
      <div className="page-shell manuals-section__grid">
        <header className="section-intro">
          <p className="eyebrow">The five manuals</p>
          <h2 id="manuals-title">Explore what<br />matters<span className="accent">.</span></h2>
          <p>Everything you need to build a meaningful and successful life in today’s world.</p>
          <a className="dark-button" href="#manual-grid">Explore all manuals <Icon name="arrow" size={17} /></a>
        </header>
        <div className="manual-grid" id="manual-grid">
          {manuals.map((manual) => (
            <a className="manual-card" style={{ backgroundColor: manual.color }} href={`/${manual.slug}`} key={manual.slug}>
              <h3>{manual.name}</h3>
              <span className="manual-card__image"><img src={manual.image} alt={manual.imageAlt} loading="lazy" width="1200" height="800" /></span>
              <p>{manual.description}</p>
              <span className="manual-card__link">Explore <Icon name="arrow" size={16} /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
