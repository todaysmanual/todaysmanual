"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { CategoryRecord, SiteConfig } from "@/lib/cms/types";
import { BrandLogo } from "./BrandLogo";
import { Icon, type IconName } from "./Icon";
const timeZones = [
  { label: "ACC", zone: "Africa/Accra" },
  { label: "LDN", zone: "Europe/London" },
  { label: "NYC", zone: "America/New_York" },
] as const;

const topicDestinations: Record<string, string> = {
  "career change": "/article/find-your-next-step",
  ai: "/article/skills-that-will-pay-in-2030",
  salary: "/article/salary-is-not-net-worth",
  cv: "/article/the-interview-manual",
  masters: "/article/what-happens-after-university",
  entrepreneurship: "/article/build-something-of-your-own",
  "remote work": "/article/start-your-career",
  money: "/money",
  productivity: "/article/grow-faster-at-work",
};

function topicHref(topic: string) {
  return topicDestinations[topic.toLowerCase()] ?? `/article/${topic.toLowerCase().replaceAll(" ", "-")}`;
}

function getWorldTimes() {
  const now = new Date();
  return Object.fromEntries(
    timeZones.map(({ label, zone }) => [
      label,
      new Intl.DateTimeFormat("en-GB", {
        timeZone: zone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now),
    ]),
  );
}

export function Header({ issueDate, initialWorldTimes, config, categories }: { issueDate: string; initialWorldTimes: Record<string, string>; config: SiteConfig; categories: CategoryRecord[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [worldTimes, setWorldTimes] = useState<Record<string, string>>(initialWorldTimes);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredTopics = useMemo(
    () => config.popularTopics.filter((topic) => topic.toLowerCase().includes(query.toLowerCase())),
    [config.popularTopics, query],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.toggle("overlay-open", searchOpen || menuOpen);
    if (searchOpen) window.setTimeout(() => searchRef.current?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("overlay-open");
    };
  }, [searchOpen, menuOpen]);

  useEffect(() => {
    const timer = window.setInterval(() => setWorldTimes(getWorldTimes()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <header className="site-header">
        <div className="info-bar page-shell">
          <div className="info-bar__topics">
            <strong>{config.headerLabel}</strong>
            {config.headerTopics.map((topic) => <span key={topic}>{topic}</span>)}
          </div>
          <div className="info-bar__right">
            <div className="header-contact">
              <a className="header-contact__email" href={`mailto:${config.contactEmail}`} aria-label={`Email Today’s Manual at ${config.contactEmail}`}>
                <Icon name="mail" size={13} />
                <span>{config.contactEmail}</span>
              </a>
              <div className="header-socials" aria-label="Today’s Manual header social media">
                {config.socialLinks.map((social) => (
                  <a href={social.href} aria-label={`Today’s Manual on ${social.label}`} target="_blank" rel="noreferrer" key={social.label}>
                    <Icon name={social.icon as IconName} size={13} />
                  </a>
                ))}
              </div>
            </div>
            <div className="world-clocks" aria-label="World clocks">
              <Icon name="clock" size={13} />
              {timeZones.map(({ label, zone }) => (
                <time key={label} aria-label={`${label} time zone, ${worldTimes[label] ?? "loading"}`} data-zone={zone}>
                  <span>{label}</span> {worldTimes[label] ?? "--:--"}
                </time>
              ))}
            </div>
            <p className="info-bar__issue"><span>{config.issueLabel}</span> <i /> <time>{issueDate}</time></p>
          </div>
        </div>
        <div className="main-nav page-shell">
          <Link className="main-nav__brand" href="/" aria-label="Today’s Manual home"><BrandLogo src={config.logoUrl} /></Link>
          <nav className="main-nav__links" aria-label="Main navigation">
            {categories.map((item) => <Link key={item.slug} href={`/${item.slug}`}>{item.title}</Link>)}
          </nav>
          <div className="main-nav__actions">
            <button className="icon-button" type="button" onClick={() => setSearchOpen(true)} aria-label="Open search"><Icon name="search" size={22} /></button>
            <a className="icon-button mobile-email-button" href={`mailto:${config.contactEmail}`} aria-label={`Email Today’s Manual at ${config.contactEmail}`}><Icon name="mail" size={20} /></a>
            <Link className="manual-link" href="#the-manual">The Manual <Icon name="chevron" size={16} /></Link>
            <Link className="subscribe-button" href="#newsletter">Subscribe</Link>
            <button className="icon-button menu-button" type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Icon name="menu" size={24} /></button>
          </div>
        </div>
      </header>

      <div className={`mobile-drawer${menuOpen ? " is-open" : ""}`} aria-hidden={!menuOpen}>
        <button className="overlay-backdrop" type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu" />
        <div className="mobile-drawer__panel" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="mobile-drawer__head">
            <Link href="/" onClick={() => setMenuOpen(false)}><BrandLogo src={config.logoUrl} /></Link>
            <button className="icon-button" type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu"><Icon name="close" size={24} /></button>
          </div>
          <nav aria-label="Mobile navigation">
            {categories.map((item, index) => (
              <Link key={item.slug} href={`/${item.slug}`} onClick={() => setMenuOpen(false)}><span>{String(index + 1).padStart(2, "0")}</span>{item.title}<Icon name="arrow" /></Link>
            ))}
          </nav>
          <Link className="mobile-drawer__subscribe" href="#newsletter" onClick={() => setMenuOpen(false)}>Get the Morning Manual <Icon name="arrow" /></Link>
          <div className="mobile-drawer__contact">
            <p className="eyebrow">Contact and follow</p>
            <a className="mobile-drawer__email" href={`mailto:${config.contactEmail}`}>
              <Icon name="mail" size={18} />
              <span>{config.contactEmail}</span>
            </a>
            <div className="mobile-drawer__socials" aria-label="Today’s Manual mobile social media">
              {config.socialLinks.map((social) => (
                <a href={social.href} aria-label={`Today’s Manual on ${social.label}`} target="_blank" rel="noreferrer" key={social.label}>
                  <Icon name={social.icon as IconName} size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`search-overlay${searchOpen ? " is-open" : ""}`} aria-hidden={!searchOpen}>
        <div className="search-overlay__top page-shell">
          <span className="eyebrow">Search Today’s Manual</span>
          <button className="icon-button" type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><Icon name="close" size={28} /></button>
        </div>
        <div className="search-overlay__content">
          <h2>What are you trying<br />to figure out<span className="accent">?</span></h2>
          <label className="search-field">
            <span className="sr-only">Search topics</span>
            <Icon name="search" size={28} />
            <input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search careers, money, skills…" />
          </label>
          <div className="popular-topics">
            <p className="eyebrow">Popular topics</p>
            <div>
              {(query ? filteredTopics : config.popularTopics).map((topic) => (
                <Link key={topic} href={topicHref(topic)} onClick={() => setSearchOpen(false)}>{topic}<Icon name="arrow" size={16} /></Link>
              ))}
              {query && filteredTopics.length === 0 && <p className="search-empty">No matching topic yet. Try a broader search.</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
