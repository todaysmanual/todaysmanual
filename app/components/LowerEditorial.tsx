/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { dailyBriefs } from "../data/homepage";
import { Icon } from "./Icon";

export function LowerEditorial() {
  return (
    <section className="lower-editorial section-rule" aria-label="Today’s Manual editorial highlights">
      <div className="page-shell lower-editorial__grid">
        <section className="daily-brief" aria-labelledby="daily-title">
          <h2 className="eyebrow" id="daily-title">3 things you should know today</h2>
          <ol>
            {dailyBriefs.map((item) => (
              <li key={item.id}>
                <span>{item.id}</span>
                <div><strong>{item.title}</strong><small>{item.meta}</small></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="voices" aria-labelledby="voices-title">
          <div className="editorial-heading">
            <div><h2 className="eyebrow" id="voices-title">Voices</h2><p>Real stories from young Africans.</p></div>
            <Link className="text-link" href="/article/voices">See all stories <Icon name="arrow" size={16} /></Link>
          </div>
          <figure>
            <span className="quote-mark" aria-hidden="true">“</span>
            <img src="/editorial/voice.jpg" alt="A young Ghanaian man speaking during a University of Ghana workshop" loading="lazy" width="900" height="1350" />
            <blockquote>I thought getting a degree was enough.</blockquote>
            <figcaption>— Kofi, 26, Accra</figcaption>
          </figure>
          <div className="carousel-dots" aria-label="Story 1 of 5"><i className="active" /><i /><i /><i /><i /></div>
        </section>

        <section className="featured-manual" id="the-manual" aria-labelledby="featured-manual-title">
          <div className="editorial-heading">
            <div><h2 className="eyebrow" id="featured-manual-title">The Manual</h2><p>Definitive guides for every stage of your journey.</p></div>
            <Link className="text-link" href="/article/the-manual">See all manuals <Icon name="arrow" size={16} /></Link>
          </div>
          <Link className="book-feature" href="/article/the-interview-manual">
            <span className="book-cover">
              <strong>The Interview<br />Manual</strong>
              <small>Everything you need before, during and after an interview.</small>
              <span>12 min read <Icon name="arrow" size={15} /></span>
            </span>
            <img src="/editorial/interview.jpg" alt="Ghanaian broadcaster Anita Erskine taking part in a television interview" loading="lazy" width="1200" height="801" />
          </Link>
        </section>
      </div>
    </section>
  );
}
