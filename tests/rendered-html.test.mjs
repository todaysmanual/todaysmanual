import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the complete Today's Manual editorial homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Nobody Told Us/);
  assert.match(html, /After University/);
  assert.match(html, /Where are you/);
  assert.match(html, /The five manuals/i);
  assert.match(html, /The Morning Manual/);
  assert.match(html, /World clocks/);
  assert.match(html, /header social media/);
  assert.match(html, /mobile social media/);
  assert.match(html, /Email Today’s Manual at todaysmanual@gmail\.com/);
  assert.match(html, /ACC/);
  assert.match(html, /LDN/);
  assert.match(html, /NYC/);
  assert.match(html, /Made in Africa/);
  assert.match(html, /mailto:todaysmanual@gmail\.com/);
  assert.match(html, /facebook\.com\/profile\.php\?id=61593445161962/);
  assert.match(html, /instagram\.com\/todaysmanual/);
  assert.match(html, /tiktok\.com\/@todaysmanualofficial/);
  assert.match(html, /linkedin\.com\/in\/todaysmanual-undefined-538a70429/);
  assert.match(html, /youtube\.com\/@todaysmanual/);
  assert.match(html, /href="\/image-credits"/);
  assert.doesNotMatch(html, /href="https:\/\/x\.com"/);
  assert.match(html, /href="https:\/\/todaysmanual\.com\/todaysmanuallogo\.png"/);
  assert.match(html, /src="\/todaysmanual1\.png"/);
  assert.doesNotMatch(html, /COMING SOON|codex-preview|Your site is taking shape/);
});

test("serves the Ghana-focused open image credit register", async () => {
  const response = await render("/image-credits");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Ghana image credits/);
  assert.match(html, /Zapsmedia25/);
  assert.match(html, /Bank of Ghana/);
  assert.match(html, /CC BY-SA 4\.0/);
  assert.match(html, /creativecommons\.org/);
  assert.match(html, /commons\.wikimedia\.org/);
});

test("serves every article linked from the homepage and footer", async () => {
  const slugs = [
    "the-interview-manual",
    "prepare-before-graduating",
    "start-your-career",
    "grow-faster-at-work",
    "build-something-of-your-own",
    "find-your-next-step",
    "voices",
    "about-us",
    "our-mission",
    "editorial-principles",
    "write-for-us",
    "contributors",
    "the-manual",
    "opportunities",
    "podcast",
    "videos",
    "advertise",
    "partner-with-us",
    "privacy-policy",
    "terms-of-use",
  ];

  for (const slug of slugs) {
    const response = await render(`/article/${slug}`);
    assert.equal(response.status, 200, `${slug} should render`);
  }

  const interview = await (await render("/article/the-interview-manual")).text();
  assert.match(interview, /Before the interview/);
  assert.match(interview, /During the interview/);
  assert.match(interview, /After the interview/);
});

test("serves an accessible contact form linked from the footer", async () => {
  const response = await render("/contact");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Let’s talk/);
  assert.match(html, /name="email"/);
  assert.match(html, /name="subject"/);
  assert.match(html, /name="message"/);

  const homepage = await (await render()).text();
  assert.match(homepage, /href="\/contact"/);
});

test("searches live editorial content with ranking, synonyms and typo tolerance", async () => {
  const homepage = await (await render()).text();
  assert.match(homepage, /action="\/search"/);
  assert.match(homepage, /Search all articles/);

  const typoResponse = await render("/search?q=intervew");
  assert.equal(typoResponse.status, 200);
  const typoHtml = await typoResponse.text();
  assert.match(typoHtml, /Results for/);
  assert.match(typoHtml, /intervew/);
  assert.match(typoHtml, /The Interview Manual/);

  const synonymHtml = await (await render("/search?q=finance")).text();
  assert.match(synonymHtml, /Your Salary Isn’t Your Net Worth/);

  const emptyHtml = await (await render("/search?q=zzzz-no-such-guide")).text();
  assert.match(emptyHtml, /No results found/);
  assert.match(emptyHtml, /Browse every article/);
});

test("includes responsive, accessible, motion-aware production styling", async () => {
  const [css, packageJson] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@media \(max-width:\s*640px\)/);
  assert.match(css, /@media \(max-width:\s*380px\)/);
  assert.match(css, /overflow-x:\s*hidden/);
  assert.match(css, /\.search-overlay/);
  assert.match(css, /\.header-socials/);
  assert.match(css, /\.mobile-email-button/);
  assert.match(packageJson, /"next"/);

  await Promise.all([
    access(new URL("../public/todaysmanuallogo.png", import.meta.url)),
    access(new URL("../public/todaysmanual1.png", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
    access(new URL("../public/editorial/student.jpg", import.meta.url)),
    access(new URL("../public/editorial/hero-laptop.jpg", import.meta.url)),
    access(new URL("../app/data/imageCredits.ts", import.meta.url)),
  ]);
});
