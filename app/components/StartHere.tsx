import { startHereItems } from "../data/homepage";
import { Icon } from "./Icon";

export function StartHere() {
  return (
    <section className="start-here section-rule" aria-labelledby="start-here-title">
      <svg className="route-line" viewBox="0 0 1440 250" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-20 205 C 150 260, 162 56, 345 175 S 670 148, 810 88 S 1090 160, 1460 22" />
        <circle cx="205" cy="164" r="6" /><circle cx="807" cy="88" r="5" /><circle cx="1372" cy="36" r="5" />
      </svg>
      <div className="page-shell start-here__grid">
        <header className="section-intro section-intro--compact">
          <p className="eyebrow">Start here</p>
          <h2 id="start-here-title">Where are you<br />right now<span className="accent">?</span></h2>
        </header>
        <div className="start-cards">
          {startHereItems.map((item) => (
            <a className="start-card" href={item.href} key={item.title}>
              <span className="start-card__icon" style={{ backgroundColor: item.color }}><Icon name={item.icon} size={27} /></span>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
              <Icon name="arrow" size={20} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

