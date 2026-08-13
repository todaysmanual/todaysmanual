import { Icon } from "./Icon";
import { WaitlistForm } from "./WaitlistForm";

export function Newsletter() {
  return (
    <section className="newsletter-wrap" id="newsletter" aria-labelledby="newsletter-title">
      <div className="page-shell">
        <div className="newsletter">
          <div className="newsletter__intro">
            <span className="newsletter__icon"><Icon name="mail" size={27} /></span>
            <div><h2 id="newsletter-title">The Morning Manual</h2><p>Three useful things. Five minutes. Every morning.</p></div>
          </div>
          <div className="newsletter__form"><WaitlistForm /></div>
        </div>
      </div>
    </section>
  );
}

