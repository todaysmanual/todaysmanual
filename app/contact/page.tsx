import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "../components/BrandLogo";
import { ContactForm } from "../components/ContactForm";
import { Icon } from "../components/Icon";
import { SiteFooter } from "../components/SiteFooter";
import { getContentBundle } from "@/lib/cms/content";

export const metadata: Metadata = {
  title: "Contact | Today’s Manual",
  description: "Contact Today’s Manual about editorial work, partnerships, advertising, corrections or general questions.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const { config } = await getContentBundle();

  return <>
    <main className="contact-page">
      <nav className="article-nav page-shell" aria-label="Contact navigation">
        <Link href="/" className="article-nav__logo"><BrandLogo src={config.logoUrl} /></Link>
        <Link href="/" className="route-page__back"><Icon name="arrow" size={17} /> Back to home</Link>
      </nav>
      <section className="contact-page__layout page-shell">
        <header>
          <p className="eyebrow eyebrow--orange">Contact Today’s Manual</p>
          <h1>Let’s talk<span className="accent">.</span></h1>
          <p>Questions, corrections, story ideas and partnerships are welcome. Send a message and it will arrive directly in the owner studio.</p>
          <div className="contact-page__direct"><span>Email directly</span><a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a></div>
        </header>
        <ContactForm />
      </section>
    </main>
    <SiteFooter year={new Date().getFullYear()} config={config} />
  </>;
}
