"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { popularTopics } from "../data/homepage";
import { BrandLogo } from "./BrandLogo";
import { Icon } from "./Icon";

const navItems = ["Work", "Money", "Skills", "Life", "Opportunity"];
const newsTopics = ["AI", "Careers", "Money", "Ghana", "Business"];

export function Header({ issueDate }: { issueDate: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredTopics = useMemo(
    () => popularTopics.filter((topic) => topic.toLowerCase().includes(query.toLowerCase())),
    [query],
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

  return (
    <>
      <header className="site-header">
        <div className="info-bar page-shell">
          <div className="info-bar__topics">
            <strong>Today in the Manual</strong>
            {newsTopics.map((topic) => <span key={topic}>{topic}</span>)}
          </div>
          <p>Issue 001 <i /> {issueDate}</p>
        </div>
        <div className="main-nav page-shell">
          <Link className="main-nav__brand" href="/" aria-label="Today’s Manual home"><BrandLogo /></Link>
          <nav className="main-nav__links" aria-label="Main navigation">
            {navItems.map((item) => <Link key={item} href={`/${item.toLowerCase()}`}>{item}</Link>)}
          </nav>
          <div className="main-nav__actions">
            <button className="icon-button" type="button" onClick={() => setSearchOpen(true)} aria-label="Open search"><Icon name="search" size={22} /></button>
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
            <Link href="/" onClick={() => setMenuOpen(false)}><BrandLogo /></Link>
            <button className="icon-button" type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu"><Icon name="close" size={24} /></button>
          </div>
          <nav aria-label="Mobile navigation">
            {navItems.map((item, index) => (
              <Link key={item} href={`/${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}><span>0{index + 1}</span>{item}<Icon name="arrow" /></Link>
            ))}
          </nav>
          <Link className="mobile-drawer__subscribe" href="#newsletter" onClick={() => setMenuOpen(false)}>Get the Morning Manual <Icon name="arrow" /></Link>
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
              {(query ? filteredTopics : popularTopics).map((topic) => (
                <Link key={topic} href={`/article/${topic.toLowerCase().replaceAll(" ", "-")}`} onClick={() => setSearchOpen(false)}>{topic}<Icon name="arrow" size={16} /></Link>
              ))}
              {query && filteredTopics.length === 0 && <p className="search-empty">No matching topic yet. Try a broader search.</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
