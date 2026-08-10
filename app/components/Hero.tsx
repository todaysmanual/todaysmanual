"use client";

import { MouseEvent, useEffect, useRef } from "react";
import { BrandLogo } from "./BrandLogo";
import { RouteBackground } from "./RouteBackground";
import { WaitlistForm } from "./WaitlistForm";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      heroRef.current?.querySelectorAll<HTMLElement>(".fm-reveal").forEach((element) => {
        element.style.opacity = "1";
        element.style.transform = "none";
      });
      return;
    }

    let active = true;
    void import("framer-motion/dom").then(({ animate }) => {
      if (!active || !heroRef.current) return;
      heroRef.current.querySelectorAll<HTMLElement>(".fm-reveal").forEach((element) => {
        const delay = Number(element.dataset.motionDelay ?? 0);
        void animate(
          element,
          { opacity: [0, 1], transform: ["translateY(20px)", "translateY(0px)"] },
          { duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] },
        );
      });
    });

    return () => {
      active = false;
    };
  }, []);

  function handlePointerMove(event: MouseEvent<HTMLElement>) {
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    heroRef.current?.style.setProperty(
      "--pointer-x",
      `${((event.clientX / window.innerWidth) - 0.5) * 10}px`,
    );
    heroRef.current?.style.setProperty(
      "--pointer-y",
      `${((event.clientY / window.innerHeight) - 0.5) * 10}px`,
    );
  }

  return (
    <main ref={heroRef} className="hero" onMouseMove={handlePointerMove}>
      <RouteBackground />
      <div className="hero__noise" aria-hidden="true" />

      <header className="masthead">
        <a className="brand-link" href="/" aria-label="Today's Manual home">
          <BrandLogo />
        </a>
        <div className="edition fm-reveal" data-motion-delay="0.42">
          <span className="edition__dot" />
          ISSUE 00&nbsp;&nbsp;/&nbsp;&nbsp;ARRIVING SOON
        </div>
      </header>

      <section className="hero__content" aria-labelledby="coming-soon-title">
        <p className="hero__kicker fm-reveal" data-motion-delay="0.55">
          A new media platform for the world we live in now.
        </p>

        <div className="headline-wrap">
          <h1
            id="coming-soon-title"
            className="fm-reveal"
            data-motion-delay="0.66"
          >
            <span>COMING</span>
            <span>SOON<span className="headline-stop">.</span></span>
          </h1>
          <span className="headline-index fm-reveal" data-motion-delay="1.05">
            01—05
          </span>
        </div>

        <div className="hero__copy fm-reveal" data-motion-delay="0.9">
          <p className="hero__statement">
            A modern guide for a generation finding its way through work, money,
            skills, life and everything changing around us.
          </p>
          <p className="hero__support">
            Helping our generation move with clarity, adapt faster and build toward
            what comes next.
          </p>
        </div>

        <div className="hero__form fm-reveal" data-motion-delay="1.08">
          <WaitlistForm />
        </div>
      </section>

      <aside className="manifesto fm-reveal" data-motion-delay="1.15">
        <span>THE WORLD CHANGED.</span>
        <span>THE MANUAL CHANGED WITH IT.</span>
      </aside>

      <footer className="footer fm-reveal" data-motion-delay="1.25">
        <div className="footer__domain">todaysmanual.com</div>
        <nav className="footer__topics" aria-label="Editorial themes">
          <span>WORK</span><i />
          <span>MONEY</span><i />
          <span>SKILLS</span><i />
          <span>LIFE</span><i />
          <span>OPPORTUNITY</span>
        </nav>
        <a className="footer__contact" href="mailto:todaysmanual@gmail.com">
          todaysmanual@gmail.com
        </a>
      </footer>
    </main>
  );
}
