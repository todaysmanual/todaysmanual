/* eslint-disable @next/next/no-img-element */
import type { CategoryRecord, SiteConfig } from "@/lib/cms/types";
import { Icon } from "./Icon";

export function Manuals({ categories, config }: { categories: CategoryRecord[]; config: SiteConfig }) {
  return (
    <section className="manuals-section section-rule" aria-labelledby="manuals-title">
      <div className="page-shell manuals-section__grid">
        <header className="section-intro">
          <p className="eyebrow">{config.manualsEyebrow}</p>
          <h2 id="manuals-title">{config.manualsTitle}</h2>
          <p>{config.manualsDescription}</p>
          <a className="dark-button" href="#manual-grid">Explore all manuals <Icon name="arrow" size={17} /></a>
        </header>
        <div className="manual-grid" id="manual-grid">
          {categories.map((manual) => (
            <a className="manual-card" style={{ backgroundColor: manual.color }} href={`/${manual.slug}`} key={manual.slug}>
              <h3>{manual.title} Manual</h3>
              <span className="manual-card__image"><img src={manual.image_url} alt={manual.image_alt} loading="lazy" width="1200" height="800" /></span>
              <p>{manual.description}</p>
              <span className="manual-card__link">Explore <Icon name="arrow" size={16} /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
