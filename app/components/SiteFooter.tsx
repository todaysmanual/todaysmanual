import Link from "next/link";
import type { SiteConfig } from "@/lib/cms/types";
import { BrandLogo } from "./BrandLogo";
import { Icon } from "./Icon";

export function SiteFooter({ year, config }: { year: number; config: SiteConfig }) {
  return (
    <footer className="site-footer">
      <div className="page-shell site-footer__grid">
        <div className="footer-brand">
          <Link href="/" aria-label="Today’s Manual home"><BrandLogo src={config.logoUrl} /></Link>
          <p>{config.footerDescription}</p>
          <a className="footer-email" href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a>
          <div className="social-links" aria-label="Today’s Manual social media">
            {config.socialLinks.map((social) => (
              <a href={social.href} aria-label={`Today’s Manual on ${social.label}`} target="_blank" rel="noreferrer" key={social.label}>
                <Icon name={social.icon as import("./Icon").IconName} />
              </a>
            ))}
          </div>
        </div>
        {config.footerColumns.map((column) => (
          <nav className="footer-column" aria-label={column.title} key={column.title}>
            <h2>{column.title}</h2>
            {column.links.map((link) => <Link href={link.href} key={`${column.title}-${link.label}`}>{link.label}</Link>)}
          </nav>
        ))}
        <div className="footer-signoff">
          <p>© {year} Today’s Manual<br />All rights reserved.</p>
          <p>{config.footerSignoff}</p>
          <i aria-hidden="true" />
        </div>
      </div>
    </footer>
  );
}
