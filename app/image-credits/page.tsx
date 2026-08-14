/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "../components/BrandLogo";
import { Icon } from "../components/Icon";
import { SiteFooter } from "../components/SiteFooter";
import { getContentBundle } from "@/lib/cms/content";

export const metadata: Metadata = {
  title: "Image Credits | Today’s Manual",
  description: "Creators, source pages and open licenses for editorial photography used by Today’s Manual.",
};

export const dynamic = "force-dynamic";

export default async function ImageCreditsPage() {
  const year = new Date().getFullYear();
  const { config } = await getContentBundle();

  return (
    <>
      <main className="credits-page">
        <nav className="article-nav page-shell" aria-label="Image credits navigation">
          <Link href="/" className="article-nav__logo"><BrandLogo src={config.logoUrl} /></Link>
          <Link href="/" className="route-page__back"><Icon name="arrow" size={17} /> Back to home</Link>
        </nav>
        <header className="credits-page__header page-shell">
          <p className="eyebrow eyebrow--orange">Open media register</p>
          <h1>Ghana image credits<span className="accent">.</span></h1>
          <p>These editorial images come from Wikimedia Commons and depict people, places and institutions in Ghana. Each credit below records the creator, source page and reuse license.</p>
        </header>
        <section className="credits-grid page-shell" aria-label="Editorial image credits">
          {config.imageCredits.map((credit) => (
            <article className="credit-card" key={credit.file}>
              <img src={credit.imageUrl ?? `/editorial/${credit.file}`} alt={credit.alt} loading="lazy" width="1200" height="800" />
              <div>
                <p className="eyebrow">{credit.placement}</p>
                <h2>{credit.title}</h2>
                <p>Photograph: {credit.creator}</p>
                {credit.note && <p>{credit.note}</p>}
                <span>
                  <a href={credit.sourceUrl} target="_blank" rel="noreferrer">View original <Icon name="arrow" size={15} /></a>
                  <a href={credit.licenseUrl} target="_blank" rel="noreferrer">{credit.license} <Icon name="arrow" size={15} /></a>
                </span>
              </div>
            </article>
          ))}
        </section>
        <div className="credits-page__note page-shell">
          <p>Today’s Manual does not imply that the photographers or pictured people endorse this publication. Images are displayed with responsive browser crops; the original source pages remain linked above.</p>
        </div>
      </main>
      <SiteFooter year={year} config={config} />
    </>
  );
}
