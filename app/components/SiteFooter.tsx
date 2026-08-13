import { BrandLogo } from "./BrandLogo";
import { Icon } from "./Icon";

const columns = [
  { title: "Explore", links: ["Work Manual", "Money Manual", "Skills Manual", "Life Manual", "Opportunity Manual"] },
  { title: "About", links: ["About Us", "Our Mission", "Editorial Principles", "Write for Us", "Contributors"] },
  { title: "Resources", links: ["The Manual", "Opportunities", "Newsletter", "Podcast", "Videos"] },
  { title: "Support", links: ["Contact Us", "Advertise", "Partner With Us", "Privacy Policy", "Terms of Use"] },
];

function slugFor(label: string) {
  const normalized = label.toLowerCase().replace(" manual", "");
  if (["work", "money", "skills", "life", "opportunity"].includes(normalized)) return `/${normalized}`;
  return `/article/${label.toLowerCase().replaceAll(" ", "-")}`;
}

export function SiteFooter({ year }: { year: number }) {
  return (
    <footer className="site-footer">
      <div className="page-shell site-footer__grid">
        <div className="footer-brand">
          <Link href="/" aria-label="Today’s Manual home"><BrandLogo /></Link>
          <p>A guide for the generation building tomorrow. Practical knowledge, honest conversations and useful direction for navigating careers, business and life in modern Africa.</p>
          <div className="social-links">
            <a href="https://www.instagram.com" aria-label="Instagram"><Icon name="instagram" /></a>
            <a href="https://x.com" aria-label="X"><Icon name="x" /></a>
            <a href="https://www.tiktok.com" aria-label="TikTok"><Icon name="tiktok" /></a>
            <a href="https://www.linkedin.com" aria-label="LinkedIn"><Icon name="linkedin" /></a>
            <a href="https://www.youtube.com" aria-label="YouTube"><Icon name="play" /></a>
          </div>
        </div>
        {columns.map((column) => (
          <nav className="footer-column" aria-label={column.title} key={column.title}>
            <h2>{column.title}</h2>
            {column.links.map((link) => <Link href={slugFor(link)} key={link}>{link}</Link>)}
          </nav>
        ))}
        <div className="footer-signoff">
          <p>© {year} Today’s Manual<br />All rights reserved.</p>
          <p>Made in Africa for<br />the world we live in.</p>
          <i aria-hidden="true" />
        </div>
      </div>
    </footer>
  );
}
import Link from "next/link";
