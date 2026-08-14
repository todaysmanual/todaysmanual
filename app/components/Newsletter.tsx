import { Icon } from "./Icon";
import { WaitlistForm } from "./WaitlistForm";
import type { SiteConfig } from "@/lib/cms/types";

export function Newsletter({ config }: { config: SiteConfig }) {
  return (
    <section className="newsletter-wrap" id="newsletter" aria-labelledby="newsletter-title">
      <div className="page-shell">
        <div className="newsletter">
          <div className="newsletter__intro">
            <span className="newsletter__icon"><Icon name="mail" size={27} /></span>
            <div><h2 id="newsletter-title">{config.newsletter.title}</h2><p>{config.newsletter.description}</p></div>
          </div>
          <div className="newsletter__form"><WaitlistForm copy={config.newsletter} /></div>
        </div>
      </div>
    </section>
  );
}
